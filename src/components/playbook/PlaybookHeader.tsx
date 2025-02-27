
import React from "react";

interface PlaybookHeaderProps {
  title: string;
  description: string;
}

export const PlaybookHeader = ({ title, description }: PlaybookHeaderProps) => {
  return (
    <>
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </>
  );
};
