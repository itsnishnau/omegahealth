# Omega Health

A teen-friendly menstrual health tracking and wellness app built with Next.js, TypeScript, and Tailwind CSS.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Features in the current build

- Landing and welcome experience
- Authentication entry flow and onboarding shell
- Dashboard with cycle status, calendar, mood, flow, and symptom logging
- Doctor notes, nutrition, education, and wellness sections
- Privacy-oriented settings and data deletion UX
- PWA manifest foundation and install-ready metadata

## Notes

This project is structured as a working MVP foundation for Omega Health, with care taken to avoid making unverified medical claims and to keep the UX supportive and privacy-conscious.

## Dictation and doctor reports

Doctor Notes and Activity Logger use the reusable `components/SpeechToTextButton.tsx` control. Dictated words append to the current text and remain editable before saving. Recognition supports the browser's `SpeechRecognition` or `webkitSpeechRecognition` implementation; microphone permission and browser support are required. Recognition is stopped when its editor closes. Audio is not saved by the app, though the browser's speech service may process recognition.

Doctor Notes can also generate a client-side PDF visit summary. Private notes are excluded unless selected, and the preview distinguishes observed records from cycle estimates. The PDF is generated locally and is not sent to a server.
