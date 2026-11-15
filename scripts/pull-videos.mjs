import { loadEnvFile } from 'node:process';
import { access, link, mkdir, unlink, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const root = fileURLToPath(new URL('../', import.meta.url));

async function main() {
  for (const filename of ['.env.local', '.env.download.local']) {
    try { loadEnvFile(join(root, filename)); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }

  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Set VITE_SUPABASE_URL in .env.local and SUPABASE_SERVICE_ROLE_KEY in .env.download.local. Never use a VITE_ prefix for the private key.');
  }

  const destination = join(root, 'videos');
  await mkdir(destination, { recursive: true });
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const bucket = client.storage.from('reaction-videos');
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (let offset = 0; ; offset += 100) {
    const { data: files, error } = await bucket.list('', {
      limit: 100, offset, sortBy: { column: 'name', order: 'asc' },
    });
    if (error) throw new Error(`Cannot list private recordings: ${error.message}`);

    for (const file of files) {
      // Only root-level video filenames; never trust remote path components.
      if (!file.id || !/^[a-zA-Z0-9][a-zA-Z0-9._-]*\.(mp4|webm)$/i.test(file.name)) continue;
      const target = join(destination, file.name);
      try { await access(target); skipped++; continue; }
      catch (error) { if (error.code !== 'ENOENT') throw error; }

      const { data, error: downloadError } = await bucket.download(file.name);
      if (downloadError) {
        console.error(`Could not download ${file.name}: ${downloadError.message}`);
        failed++;
        continue;
      }

      const temporary = join(destination, `.download-${randomUUID()}.part`);
      let created = false;
      try {
        await writeFile(temporary, new Uint8Array(await data.arrayBuffer()), { flag: 'wx', mode: 0o600 });
        created = true;
        // Atomically publish a complete file without overwriting local work.
        await link(temporary, target);
        downloaded++;
        console.log(`Saved videos/${file.name}`);
      } catch (error) {
        if (error.code === 'EEXIST') skipped++;
        else throw error;
      } finally {
        if (created) await unlink(temporary);
      }
    }
    if (files.length < 100) break;
  }

  console.log(`Finished: ${downloaded} downloaded, ${skipped} already present, ${failed} failed.`);
  console.log('Supabase originals are unchanged. Local videos are excluded from Git.');
  if (failed) process.exitCode = 1;
}

main().catch(error => {
  console.error(`Video download failed: ${error.message}`);
  process.exitCode = 1;
});
