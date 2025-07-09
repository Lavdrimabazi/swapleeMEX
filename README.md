# Swaplee - Lightning Cryptocurrency Exchange

A modern, pixelated-style cryptocurrency exchange interface built with Next.js and Tailwind CSS.

## 🚀 Live Demo

Visit the live site: [https://glowing-medovik-42e968.netlify.app](https://glowing-medovik-42e968.netlify.app)

## ✨ Features

- **Non-custodial** cryptocurrency swapping
- **No registration** required
- **Lightning-fast** transactions
- **Pixelated retro design** with fighting game aesthetics
- **Sound effects** and animations
- **Mobile responsive** design
- **Dark/Light theme** support

## 🛠️ Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **Lucide React** - Icons
- **Next Themes** - Theme switching

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone this repository:
   ```bash
   git clone <your-repo-url>
   cd swaplee-crypto-exchange
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `out` directory.

## 🚀 Deployment

### Netlify (Recommended)

#### Option 1: Drag and Drop
1. Run `npm run build`
2. Drag the `out` folder to [Netlify](https://netlify.com)

#### Option 2: Git Integration
1. Push to GitHub
2. Connect repository in Netlify
3. Set build command: `npm run build`
4. Set publish directory: `out`

#### Option 3: Netlify CLI
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=out
```

### Other Platforms

The static export works with any static hosting service:
- Vercel
- GitHub Pages
- AWS S3
- Firebase Hosting

## 📁 Project Structure

```
├── app/                    # Next.js app router pages
│   ├── faq/               # FAQ page
│   ├── how-it-works/      # How it works page
│   ├── status/            # Status page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ui/               # UI component library
│   ├── header.tsx        # Site header
│   ├── footer.tsx        # Site footer
│   ├── swap-form.tsx     # Main swap form
│   └── ...
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── public/               # Static assets
│   └── sounds/          # Sound effects
└── styles/              # Additional styles
```

## 🎨 Design System

The project uses a pixelated, retro gaming aesthetic with:
- **Courier New** monospace font
- **Fighting game** inspired animations
- **Pixel-perfect** borders and shadows
- **Sound effects** for interactions
- **Responsive** design patterns

## 🔧 Configuration

### Environment Variables

No environment variables are required for basic functionality.

### Customization

- **Colors**: Modify `tailwind.config.ts`
- **Fonts**: Update `app/globals.css`
- **Sounds**: Replace files in `public/sounds/`
- **Animations**: Modify CSS animations in `app/globals.css`

## 📱 Mobile Support

The application is fully responsive with:
- Touch-friendly interactions
- Optimized layouts for mobile
- Proper viewport handling
- iOS/Android compatibility

## 🎵 Sound Effects

Interactive sound effects enhance the gaming experience:
- Click sounds for buttons
- Punch sounds for actions
- Success sounds for completions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the FAQ page
2. Review existing GitHub issues
3. Create a new issue with details

## 🔮 Future Enhancements

- Real cryptocurrency integration
- Advanced trading features
- Portfolio tracking
- Price charts
- Multi-language support

---

Built with ❤️ using Next.js and modern web technologies.