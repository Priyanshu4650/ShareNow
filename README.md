# ShareNow - Real-time Text Sharing App

ShareNow is a real-time text sharing application that allows users on the same local network to share and synchronize text content instantly. It's built with modern web technologies and focuses on providing a seamless, network-specific sharing experience.

## Features

### Core Functionality
- Real-time text sharing within local networks
- Network-specific text isolation (different networks maintain separate shared texts)
- Instant notifications for text updates
- Copy to clipboard functionality
- Responsive design for all device sizes

### Technical Features
- WebSocket-based real-time communication
- Network detection and isolation
- Stateful text management
- Component-level updates (no full page refreshes)
- Cross-device compatibility
- Touch-optimized mobile interface

### User Experience
- Clean, modern interface
- Animated notifications
- Visual feedback for actions
- Network status indication
- Responsive layout for all screen sizes
- Touch-friendly design

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite (Build tool)
- WebSocket API
- Modern CSS3

### Backend
- Node.js
- Express.js
- ws (WebSocket library)
- request-ip (IP detection)

### Development Tools
- ESLint
- TypeScript
- npm/yarn

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/Priyanshu4650/ShareNow.git
cd ShareNow
```

2. Install dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../
npm install
```

3. Create environment variables
```bash
# Create .env file in root directory
echo "VITE_SERVER_PORT=3000" > .env
```

### Running Locally

1. Start the server
```bash
# From the server directory
npm run dev
```

2. Start the client development server
```bash
# From the root directory
npm run dev
```

3. Access the application
- Local: `http://localhost:5173`
- On other devices: `http://<your-local-ip>:5173`
  - Find your local IP using:
    - Windows: `ipconfig` in Command Prompt
    - Mac/Linux: `ifconfig` or `ip addr` in Terminal

### Usage
1. Open the application on multiple devices connected to the same network
2. Enter text in the input field
3. Click "Save" to share the text
4. Other devices will receive a notification about new text
5. Click "Update" on other devices to see the new text
6. Use "Copy" to copy the shared text to clipboard

## Notes
- All devices must be connected to the same local network
- The server must be accessible from all client devices
- Some firewalls might need configuration to allow WebSocket connections

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
