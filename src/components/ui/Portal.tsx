import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  container?: Element | null;
}

export default function Portal({ children, container }: PortalProps) {
  const defaultContainerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!defaultContainerRef.current) {
      defaultContainerRef.current = document.body;
    }
  }, []);

  const target = container ?? defaultContainerRef.current ?? document.body;
  return createPortal(children, target);
}

