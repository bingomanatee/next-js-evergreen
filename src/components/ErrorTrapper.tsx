import { Component, ReactNode } from 'react'

type Props = { boundry: string,     children: ReactNode }
  export default class ErrorTrapper extends Component<Props, any> {
  state = {
    error: null,
  };

  static getDerivedStateFromError(error) {
    // Update state so next render shows fallback UI.
    return { error: error };
  }

  componentDidCatch(error, info) {
    // Log the error to an error reporting service
    console.log(error, info);
  }

  render() {
    if (this.state.error) {
      //@ts-ignore
      const message: string = ('message' in this.state.error) ?
        this.state.error.message : '-- no message -- ';
      return <p>Render Error: <b>{this.props.boundry}</b>:
        <code>
          {message}
        </code>
      </p>;
    }
    return this.props?.children;
  }
}
