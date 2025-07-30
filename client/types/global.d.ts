// Global type declarations to fix TypeScript issues
declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> { }
    interface ElementClass extends React.Component<any> {
      render(): React.ReactNode
    }
    interface ElementAttributesProperty { props: {} }
    interface ElementChildrenAttribute { children: {} }
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
  
  namespace React {
    interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
      type: T;
      props: P;
      key: Key | null;
    }
    interface ReactNode {}
    interface Component<P = {}, S = {}, SS = any> {}
    type Key = string | number;
    type JSXElementConstructor<P> = 
      | ((props: P) => ReactElement<any, any> | null)
      | (new (props: P) => Component<P, any>);
    type FC<P = {}> = (props: P) => ReactElement | null;
    type FormEvent<T = Element> = any;
    type ChangeEvent<T = Element> = any;
    type FocusEvent<T = Element> = any;
  }
}

export {};
