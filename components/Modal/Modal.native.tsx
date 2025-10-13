import React from 'react';
import { Pressable, Modal as RNModal, View } from 'react-native';

type Props = {
  open: boolean;
  onOpenChange?: (v: boolean) => void;
  children: React.ReactNode;
};

export default function Modal({ open, onOpenChange, children }: Props) {
  return (
    <RNModal visible={open} transparent animationType="fade" onRequestClose={() => onOpenChange?.(false)}>
      <Pressable onPress={() => onOpenChange?.(false)} style={{ flex:1, backgroundColor:'rgba(0,0,0,0.4)' }}>
        <View style={{ margin:24, marginTop:100, backgroundColor:'#fff', borderRadius:12, padding:16 }}>
          {children}
        </View>
      </Pressable>
    </RNModal>
  );
}
