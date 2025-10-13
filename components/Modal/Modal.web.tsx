import * as Dialog from '@radix-ui/react-dialog';
import React from 'react';

type Props = {
  open: boolean;
  onOpenChange?: (v: boolean) => void;
  children: React.ReactNode;
};

export default function Modal({ open, onOpenChange, children }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)' }} />
        <Dialog.Content style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%, -50%)', background:'#fff', padding:16, borderRadius:12, minWidth:320 }}>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
