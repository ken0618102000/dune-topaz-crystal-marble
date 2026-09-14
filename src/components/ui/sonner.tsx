import { Toaster as Sonner } from "sonner";

function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "bg-card text-card-foreground border-border shadow-lg",
          title: "text-foreground",
          description: "text-muted-foreground",
        },
      }}
    />
  );
}

export { Toaster };
