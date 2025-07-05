
"use client";

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

interface GameStatusProps {
  message: string;
  isError?: boolean;
}

const GameStatus: React.FC<GameStatusProps> = ({ message, isError = false }) => {
  return (
    <Alert variant={isError ? "destructive" : "default"} className="my-4 shadow-md">
      <Terminal className="h-4 w-4" />
      <AlertTitle>{isError ? "Game Alert" : "Game Status"}</AlertTitle>
      <AlertDescription>
        {message}
      </AlertDescription>
    </Alert>
  );
};

export default GameStatus;
