# Elin Hexspoor — Portfolio Website

A multi-page personal portfolio. Dark, warm, copper-accented. No build step, no framework —
just HTML, CSS and vanilla JavaScript.

## Pages

```
elin-site/
├─ index.html                         # landing: hero + contact, era timeline, role list, expertise, CTA
├─ awards.html                        # Awards & Recognition
├─ experience/
│  ├─ leger-uten-grenser.html         # Fundraiser — Doctors Without Borders (MSF)
│  ├─ greenie.html                    # Founder, CEO & Product Manager — Institute Greenie
│  ├─ university-ljubljana.html       # Researcher — Behavioural Analysis
│  ├─ drva-info.html                  # Marketing Manager — Drva.info
│  ├─ ingles.html                     # Sales, Marketing & Administration — Ingles d.o.o.
│  ├─ dobro-z-dobrim.html             # Marketing & Sales (volunteer) — Dobro z Dobrim
│  └─ gozdarjeva-koca.html            # (placeholder — needs your details)
├─ css/styles.css                     # theme + layout (change --accent for the copper tone)
├─ js/main.js                         # timeline scroll, accordion, reveals
├─ assets/
│  ├─ hero-bg.jpg                     # copper-graded hero background
│  ├─ elin-hero-original.jpg          # your original photo (used for social preview)
│  └─ Elin_Hexspoor_CV.pdf            # the "Download CV" file
└─ README.md
```

## Run locally

```bash
cd elin-site
python3 -m http.server 8000     # then open http://localhost:8000
```

## Deploy (free)

- **Netlify:** drag the `elin-site` folder onto https://app.netlify.com/drop.
- **Vercel:** `npm i -g vercel` then `vercel` inside the folder.
- **GitHub Pages:** push to a repo → Settings → Pages → deploy from `main`, root.

## Editing

- **Colour:** the copper lives in `--accent` (plus `--accent-deep` / `--accent-bright`) at the top of `css/styles.css`.
- **Timeline eras:** edit the `<li class="era">` blocks in `index.html`.
- **Role list:** edit the `<a class="rcard">` blocks in `index.html`; each links to a file in `experience/`.
- **A role's full page:** edit the matching file in `experience/`.
- **Hero photo:** replace `assets/hero-bg.jpg` (a copper-graded version) and `assets/elin-hero-original.jpg`.
- **CV:** replace `assets/Elin_Hexspoor_CV.pdf` (keep the name, or update the links).

## Notes

- The era timeline never hijacks the scroll wheel; on phones / reduced-motion it becomes a swipe carousel.
- Your previous official name is intentionally not shown anywhere.
- **`gozdarjeva-koca.html` is a placeholder** — send title, dates and a couple of duties to finish it.
- Award descriptions on `awards.html` are best-guess context; verify or edit them.
