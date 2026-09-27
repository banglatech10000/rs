import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={Home} />
      <Route path="/projects" component={Home} />
      <Route path="/projects/:slug" component={Home} />
      <Route path="/experience" component={Home} />
      <Route path="/skills" component={Home} />
      <Route path="/blog" component={Home} />
      <Route path="/blog/:slug" component={Home} />
      <Route path="/github" component={Home} />
      <Route path="/contact" component={Home} />
      <Route path="/resume" component={Home} />
      <Route path="/admin" component={Home} />
      <Route path="/404" component={Home} />
      <Route component={Home} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
