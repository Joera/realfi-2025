# as-soon

A lightweight file watcher that executes commands as soon as files change.

## What is as-soon?

`as-soon` is a command-line tool that watches specified files or directories and automatically executes a command whenever changes are detected. It's perfect for development workflows where you need to rebuild, test, or restart processes whenever your code changes.

## Features

- **Simple and fast** - Watch files and execute commands with minimal configuration
- **Flexible watching** - Watch specific directories or the current working directory
- **Debounced execution** - Commands are debounced (200ms) to avoid excessive runs during rapid file changes
- **File creation support** - Can watch for files that don't exist yet and automatically start watching them once created
- **Environment variables** - Loads environment variables from `.env` files automatically
- **Directory recreation handling** - Automatically re-subscribes when watched directories are deleted and recreated

## Installation

```bash
npm install -g as-soon
# or
pnpm add -g as-soon
```

Or use it locally in your project:

```bash
npm install -D as-soon
# or
pnpm add -D as-soon
```

## Usage

### Basic Usage

Watch the current directory and execute a command on any file change:

```bash
as-soon command
```

### Watch Specific Directories

Use the `-w` flag to watch specific directories:

```bash
as-soon -w src -w public pnpm build
```

### Watch Specific Files

You can also watch specific files:

```bash
as-soon -w package.json -w tsconfig.json pnpm build
```

### Pass Arguments to Commands

Any arguments after the command are passed through:

```bash
as-soon pnpm test -- --watch
```

### Multiple Watch Paths

Watch multiple directories:

```bash
as-soon -w src -w test pnpm build
```

## How It Works

1. **Initial Execution**: The command runs immediately when you start as-soon
2. **File Watching**: It watches the specified directories (or current directory by default)
3. **Change Detection**: When files are added, modified, or deleted, it detects the changes
4. **Debounced Execution**: After a 200ms debounce period, the command executes again
5. **Continuous Watching**: The process continues until you stop it (Ctrl+C)

## Examples

### Development Workflow

Watch your source files and rebuild on changes:

```bash
as-soon -w src pnpm build
```

### Test Runner

Run tests whenever test files change:

```bash
as-soon -w test pnpm test
```

### Type Checking

Run TypeScript type checking on file changes:

```bash
as-soon -w src tsc --noEmit
```

### Multiple Workspaces

Watch multiple directories in a monorepo:

```bash
as-soon -w packages/app/src -w packages/lib/src pnpm build
```

### Watch Non-Existent Files

You can even watch for files that don't exist yet:

```bash
as-soon -w ./config/dev.ts pnpm build
```

This is useful for configuration files that might be created later.

## Command-Line Options

- `-w <path>` - Specify a directory or file to watch (can be used multiple times)
- All other arguments are treated as the command to execute

## Environment Variables

as-soon automatically loads environment variables from `.env` files using `ldenv`.

## License

MIT