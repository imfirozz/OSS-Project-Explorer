# Contributing to Open Source GitHub Project Explorer

Thank you for your interest in contributing to **Open Source GitHub Project Explorer**! Open-source thrives when community members collaborate, report issues, suggest improvements, and write code.

---

## 📋 Code of Conduct

We are committed to providing a welcoming, diverse, and harassment-free experience for everyone. Please be respectful, constructive, and collaborative in all communications and reviews.

---

## 🛠️ Development Workflow

### 1. Fork & Clone

Fork the repository to your own GitHub account and clone it locally:

```bash
git clone https://github.com/<your-username>/OSS-Project-Explorer
cd Open-Source
```

### 2. Install Dependencies

Install the verified project dependencies using Node.js 20.19+ or 22.12+:

```bash
npm install
```

### 3. Create a Topic Branch

Always create a dedicated branch off `main` for your work:

```bash
git checkout -b feature/your-feature-name
# or for bug fixes:
git checkout -b fix/issue-description
```

### 4. Local Development

Run the Vite development server:

```bash
npm run dev
```

Visit `http://localhost:5173` to test your changes with hot reloading.

---

## 🧪 Quality Standards & Testing

Before submitting a pull request, ensure your code passes all lint and unit test checks:

```bash
# Run code quality linter
npm run lint

# Run unit and integration tests
npm test

# Verify production build compilation
npm run build
```

Please adhere to:
- Consistent code style and formatting matching existing project conventions.
- React best practices (pure components, custom hooks, proper dependency arrays).
- Accessibility standards (ARIA labels, keyboard-navigable controls, color contrast).
- Tests for any new utilities, API wrappers, or storage functions added in `tests/`.

---

## 📬 Submitting a Pull Request (PR)

1. **Commit your changes**: Write clear, descriptive commit messages.
2. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```
3. **Open a Pull Request**:
   - Provide a clear title and description explaining the motivation and changes made.
   - Reference any relevant issues (e.g., `Fixes #12`).
   - Include before/after screenshots or recordings for visual and UI updates.

---

## 💡 Reporting Bugs & Requesting Features

- **Bug Reports**: Open an issue detailing steps to reproduce, expected vs. actual behavior, browser version, and console logs.
- **Feature Suggestions**: Describe the proposed feature, the use-case it addresses, and why it benefits the community.

Thank you for helping make Project Explorer better for everyone! 🚀
