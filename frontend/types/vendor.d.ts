declare module "lucide-react" {
  type IconProps = import("react").SVGProps<SVGSVGElement> & {
    size?: number | string;
    strokeWidth?: number | string;
    absoluteStrokeWidth?: boolean;
  };

  export const CheckCircle2: import("react").ComponentType<IconProps>;
  export const Eraser: import("react").ComponentType<IconProps>;
  export const Highlighter: import("react").ComponentType<IconProps>;
  export const MessageSquareText: import("react").ComponentType<IconProps>;
  export const Redo2: import("react").ComponentType<IconProps>;
  export const Underline: import("react").ComponentType<IconProps>;
  export const Undo2: import("react").ComponentType<IconProps>;
}

declare module "@base-ui/react/button" {
  export namespace Button {
    type Props = import("react").ButtonHTMLAttributes<HTMLButtonElement> & {
      nativeButton?: boolean;
      render?: import("react").ReactElement;
    };
  }

  export const Button: import("react").ForwardRefExoticComponent<
    Button.Props & import("react").RefAttributes<HTMLButtonElement>
  >;
}
