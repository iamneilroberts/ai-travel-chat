export const ProgressIndicator = () => {
  return (
    <div className="flex space-x-2 p-3 bg-muted rounded-lg w-fit">
      <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" />
      <div className="w-2 h-2 bg-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
      <div className="w-2 h-2 bg-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
    </div>
  );
};