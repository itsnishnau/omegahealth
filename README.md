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

## Doctor Notes dictation integration

Doctor Notes is being edited by a separate contributor, so its editor was intentionally left unchanged. The reusable dictation control is available at `components/SpeechToTextButton.tsx`.

To add dictation to the Doctor Notes body editor in `app/page.tsx`, import it with the other component imports:

```tsx
import SpeechToTextButton from '../components/SpeechToTextButton';
```

In `renderDoctorNotes()`, place the control immediately before the note-body `<textarea>` (the one bound to `noteEditor.content`). Append dictated text without replacing the user's existing content:

```tsx
<SpeechToTextButton
  onTranscript={(transcript) =>
    setNoteEditor((previous) => ({
      ...previous,
      content: `${previous.content}${previous.content && !/\s$/.test(previous.content) ? ' ' : ''}${transcript}`,
    }))
  }
/>
```

The transcript remains editable in the textarea and continues to use the existing Save Note flow. Browser speech recognition may use the browser vendor's speech service; no audio is recorded or saved by this component.
