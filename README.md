# Mpuza Mobile

**Connecting skills to work: discover jobs that match your profile, right from your phone.**

![Expo](https://img.shields.io/badge/Expo-SDK-000020?logo=expo) ![React Native](https://img.shields.io/badge/React_Native-mobile-61DAFB?logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) ![Status](https://img.shields.io/badge/status-active-brightgreen) ![License](https://img.shields.io/badge/license-MIT%20%2B%20Commons%20Clause-blue)

## About

Mpuza is a platform where professionals, companies and institutions connect around skills and opportunity. This is the mobile app for job seekers. Candidates build a skills profile, and the app suggests jobs posted by employers that match that profile, so people spend less time searching and more time applying.

## Key Features

- Authentication: sign up, log in, OAuth and email verification
- Skills selection and profile that shape your job matches
- Personalised job feed with job cards
- Save favourite jobs and receive alerts
- Explore screen to search for opportunities
- Multi-language support and light/dark theme

## Tech Stack

Expo, React Native, Expo Router (file-based routing), TypeScript, React state and context, i18n, EAS Build. The backend is a separate service.

## Prerequisites

Node.js 24, npm, and either Expo Go, an Android emulator or an iOS simulator. No environment variables are needed to run the app.

## Installation & Setup

```bash
git clone https://github.com/Ange884/Mpuza-Mobile--App.git
cd Mpuza-Mobile--App
npm install
```

## Usage

```bash
npx expo start
```

Press `a` for Android, `i` for iOS, or scan the QR code with Expo Go. You can also install the Android APK directly on a phone: [download link here].

## Project Structure

```
src/
├── app/          # screens: login, signup, oauth, verify-email, skills, loading, preparing-jobs-feed
├── components/   # auth, explore, feed, icons, landing + shared UI (Logo, Reveal, ThemeSwitcher, LanguageSwitcher)
├── constants/  context/  data/  hooks/  i18n/  theme/  utils/
app.json  eas.json  eslint.config.js  tsconfig.json  package.json
```

## Roadmap

Application tracking, in-app messaging with employers, and push notifications for new matches.

## Contributing

Fork the repo, create a branch (`feature/your-feature`), commit, and open a pull request. Report bugs through GitHub Issues.

## License

MIT with the Commons Clause. You may use and modify the code, but you may not sell, rent or sub-license it. See [LICENSE](LICENSE).

## Credits & Contact

Mobile app (frontend): Ange. Backend: Melissa. Built with [Expo](https://expo.dev) and the open-source React Native community. Reach us through the [GitHub repository](https://github.com/Ange884/Mpuza-Mobile--App).
