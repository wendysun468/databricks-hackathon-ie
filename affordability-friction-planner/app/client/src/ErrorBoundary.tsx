import { Component } from 'react';
import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@databricks/appkit-ui/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught an error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background p-4">
          <Card className="mx-auto mt-8 max-w-2xl">
            <CardHeader>
              <CardTitle className="text-destructive">Application Error</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-auto rounded bg-muted p-3 text-sm">
                {this.state.error?.toString()}
              </pre>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
