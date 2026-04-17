# Contributing

Contributions are always welcome, no matter how large or small.

Before contributing, read [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

## Development Workflow

This project is a monorepo managed with Yarn workspaces:

- Library package in repository root
- Example app in `example/`

Use Yarn 3.6.1 (declared in `package.json`) via Corepack.

### Prerequisites

- Node.js installed
- Corepack enabled (`corepack enable`)
- Android Studio / Xcode if you run native targets

### Setup

Run from repository root:

```sh
corepack yarn install
```

## Quick Start (Example App)

Run from repository root.

1. Start Metro in terminal 1:

```sh
corepack yarn example:metro
```

2. Run app in terminal 2:

```sh
# Android
corepack yarn example:android

# iOS
corepack yarn example:ios

# Web
corepack yarn example:web
```

Optional Android device picker:

```sh
corepack yarn example:android -- --device
```

### Troubleshooting

- `sh: expo: command not found`: run `corepack yarn install` first, then run commands from repository root.
- `No version is set for command yarn`: use `corepack yarn ...`.
- Native code change not reflected: rebuild app with `corepack yarn example:android` or `corepack yarn example:ios`.

## Local Library Development

The example app is linked to the local library workspace:

- JavaScript/TypeScript changes are reflected without rebuilding native app
- Native module changes require rebuilding the app target

## Architecture Notes

### Picker-Agnostic File Attachment

The library does **not** import or depend on `react-native-document-picker` (or any picker).
Instead, `MultichannelWidget` accepts two props from the consumer:

| Prop | Type | Description |
|---|---|---|
| `pickImage` | `FilePicker` | Opens an image picker; called when user taps the image button |
| `pickDocument` | `FilePicker` | Opens a file/document picker; called when user taps the document button |

Both props use the exported `FilePicker` type:

```ts
type FilePicker = () => Promise<PickedFile | null | undefined>;

type PickedFile = {
  uri: string;         // local file URI
  type: string | null; // MIME type
  name: string | null; // filename with extension
};
```

**Rules when contributing:**
- Do **not** add `react-native-document-picker` (or any picker) back to `src/` or `peerDependencies`
- The library must remain picker-agnostic
- If you need a picker in the example app, import it only in `example/src/`, not in library source
- The `FilePicker` / `PickedFile` types are exported from the library entry point so consumers can type their implementations correctly

## Validation Commands

Run before opening a PR:

```sh
corepack yarn typecheck
corepack yarn lint
corepack yarn test
```

When you need to regenerate build output (`lib/`):

```sh
corepack yarn prepare
```

## Publishing

This project uses `release-it` for publishing:

```sh
corepack yarn release
```

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/en):

- `fix`: bug fixes
- `feat`: new features
- `refactor`: internal refactor
- `docs`: documentation changes
- `test`: test changes
- `chore`: tooling/config changes

## Pull Request Checklist

- Keep PRs focused and small
- Run typecheck/lint/tests locally
- Add or update tests when possible
- Update docs for behavior/API changes
