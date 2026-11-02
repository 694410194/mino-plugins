import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, rmSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packagesDir = join(root, 'packages');
const failures = [];
const args = process.argv.slice(2);
let skipInstall = false;
let out = 'dist';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--skip-install') {
    skipInstall = true;
  } else if (args[i] === '--out' && args[i + 1]) {
    out = args[++i];
  } else {
    console.error(`Unknown or incomplete argument: ${args[i]}`);
    process.exit(2);
  }
}

const outDir = resolve(root, out);
const recordFailure = message => {
  failures.push(message);
  console.error(`FAIL ${message}`);
};

function toolArgs(command, toolArgs) {
  if (command === process.execPath) return [command, toolArgs];
  if (process.platform !== 'win32') return [command, toolArgs];
  const binDir = dirname(process.execPath);
  const cli = command === 'pnpm'
    ? join(binDir, 'node_modules', 'corepack', 'dist', 'pnpm.js')
    : command === 'npm'
      ? join(binDir, 'node_modules', 'npm', 'bin', 'npm-cli.js')
      : null;
  if (cli && existsSync(cli)) return [process.execPath, [cli, ...toolArgs]];
  throw new Error(`Cannot locate the ${command} JavaScript CLI beside ${process.execPath}`);
}

function run(label, command, commandArgs, cwd) {
  console.log(`RUN ${label}`);
  try {
    const [executable, executableArgs] = toolArgs(command, commandArgs);
    execFileSync(executable, executableArgs, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    recordFailure(`${label}: ${error.message}`);
    return false;
  }
}

if (!skipInstall) run('pnpm install --frozen-lockfile', 'pnpm', ['install', '--frozen-lockfile'], root);
else console.log('SKIP pnpm install --frozen-lockfile');

run('build mino-image', 'pnpm', ['--filter', 'mino-image', 'run', 'build'], root);
run('check source client ids', process.execPath, [join(root, 'scripts', 'check-client-ids.cjs')], root);

const packages = [];
for (const dir of readdirSync(packagesDir).sort()) {
  const packageDir = join(packagesDir, dir);
  const manifestPath = join(packageDir, 'package.json');
  if (!existsSync(manifestPath)) continue;

  const entry = { dir, packageDir, pkg: null };
  packages.push(entry);
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    recordFailure(`${dir}: invalid package.json: ${error.message}`);
    continue;
  }

  entry.pkg = pkg;
  if (typeof pkg.name !== 'string' || !pkg.name.startsWith('mino-')) {
    recordFailure(`${dir}: package name must start with "mino-"`);
  }
  if (typeof pkg.version !== 'string' || pkg.version.length === 0) {
    recordFailure(`${dir}: package version is missing`);
  }

  const patchPath = join(packageDir, 'cordis.patch.yml');
  if (!existsSync(patchPath)) {
    recordFailure(`${dir}: missing cordis.patch.yml`);
  } else if (typeof pkg.name === 'string') {
    try {
      const patch = readFileSync(patchPath, 'utf8');
      // A row naming the package itself or a subpath export of it (multi-face packages expose e.g. ./deepseek-harness as the DSH entry).
      const nameLine = new RegExp(`^[\\t ]*name:[\\t ]*['"]?${pkg.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:/[^'"\\s]*)?['"]?[\\t ]*$`, 'm');
      if (!nameLine.test(patch)) {
        recordFailure(`${dir}: cordis.patch.yml has no name matching ${pkg.name}`);
      }
    } catch (error) {
      recordFailure(`${dir}: cannot read cordis.patch.yml: ${error.message}`);
    }
  }

  try {
    const licenseFiles = readdirSync(packageDir).filter(name => /^(LICENSE|LICENCE|COPYING)/i.test(name));
    if (licenseFiles.length === 0) recordFailure(`${dir}: missing LICENSE*/LICENCE*/COPYING* file`);
  } catch (error) {
    recordFailure(`${dir}: cannot inspect license files: ${error.message}`);
  }
}

let outReady = false;
try {
  if (outDir === root) throw new Error('--out cannot be the repository root');
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  outReady = true;
} catch (error) {
  recordFailure(`cannot prepare output directory ${outDir}: ${error.message}`);
}

if (outReady) {
  for (const { dir, packageDir, pkg } of packages) {
    const label = `npm pack ${pkg?.name ?? dir}`;
    try {
      const [executable, executableArgs] = toolArgs('npm', [
        'pack',
        '--ignore-scripts',
        '--pack-destination',
        outDir,
      ]);
      execFileSync(executable, executableArgs, { cwd: packageDir, stdio: 'inherit' });
    } catch (error) {
      recordFailure(`${label}: ${error.message}`);
    }
  }
}

const tarballs = outReady
  ? readdirSync(outDir).filter(name => name.endsWith('.tgz')).sort()
  : [];
if (tarballs.length !== packages.length) {
  recordFailure(`expected ${packages.length} tarballs, found ${tarballs.length}`);
}

const actualTarballs = new Set(tarballs);
for (const { dir, pkg } of packages) {
  if (!pkg) continue;
  if (typeof pkg.name !== 'string' || typeof pkg.version !== 'string') continue;
  const expected = `${pkg.name}-${pkg.version}.tgz`;
  if (!actualTarballs.has(expected)) recordFailure(`${dir}: missing tarball ${expected}`);
}

if (outReady) {
  run('verify packed client ids', process.execPath, [
    join(root, 'scripts', 'verify-tarball-client-ids.cjs'),
    outDir,
  ], root);

  for (const tarball of tarballs) {
    try {
      const entries = execFileSync('tar', ['-tzf', tarball], {
        cwd: outDir,
        encoding: 'utf8',
      }).split(/\r?\n/).filter(Boolean);
      const names = new Set(entries);
      const hasLicense = entries.some(name => /^package\/(LICENSE|LICENCE|COPYING)[^/]*$/i.test(name));
      const missing = [
        !names.has('package/package.json') && 'package/package.json',
        !names.has('package/cordis.patch.yml') && 'package/cordis.patch.yml',
        !hasLicense && 'package/LICENSE*/LICENCE*/COPYING*',
      ].filter(Boolean);
      if (missing.length) recordFailure(`${tarball}: missing ${missing.join(', ')}`);
    } catch (error) {
      recordFailure(`${tarball}: cannot inspect tarball: ${error.message}`);
    }
  }
}

console.log(`verify-all: ${packages.length} packages, ${tarballs.length} tarballs, ${failures.length} failures`);
if (failures.length) {
  console.error('Verification failures:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
}
