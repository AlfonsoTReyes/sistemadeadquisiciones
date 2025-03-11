// pusher.ts (en la raíz del proyecto)

import Pusher from 'pusher';

// Configuración de Pusher con tus credenciales
const pusher = new Pusher({
  appId: '1900300',
  key: 'a6ac33d9d15af525e0f3',
  secret: '1a2b86acd6438bf806b7',
  cluster: 'us2',
  useTLS: true
});

export default pusher;
