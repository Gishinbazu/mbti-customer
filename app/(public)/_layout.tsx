import { Slot } from 'expo-router';

export default function PublicLayout() {
  // on ne met pas le footer ici : il viendra du root si tu le gardes après <Slot />
  return <Slot />;
}
