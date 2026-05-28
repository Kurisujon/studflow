export const APPEARANCE_STORAGE_KEY = "studflow-appearance";
export const THEME_COLOR_STORAGE_KEY = "studflow-theme-color";

export type AppearanceMode = "light" | "dark";

export type ThemeColor =
  | "system"
  | "sage"
  | "blue"
  | "rose"
  | "teal"
  | "lavender"
  | "stone";

export const appearanceModes: AppearanceMode[] = ["light", "dark"];

export const themeColors = {
  system: {
    name: "System",
    primary: "#111110",
    primaryHover: "#333330",
    soft: "#FFF7ED",
    border: "#FED7AA",
  },
  sage: {
    name: "Sage",
    primary: "#7A9E7E",
    primaryHover: "#6D8F71",
    soft: "#EEF6EF",
    border: "#D9E8DB",
  },
  blue: {
    name: "Blue",
    primary: "#6B8FB8",
    primaryHover: "#5F80A6",
    soft: "#EEF4FA",
    border: "#D8E4F0",
  },
  rose: {
    name: "Rose",
    primary: "#B9828C",
    primaryHover: "#A9757E",
    soft: "#FBF0F2",
    border: "#EBD4D8",
  },
  teal: {
    name: "Teal",
    primary: "#5F9EA0",
    primaryHover: "#548D8F",
    soft: "#ECF7F7",
    border: "#D3EAEA",
  },
  lavender: {
    name: "Lavender",
    primary: "#8E8AAE",
    primaryHover: "#7F7A9E",
    soft: "#F2F1F8",
    border: "#DCD9EC",
  },
  stone: {
    name: "Stone",
    primary: "#78716C",
    primaryHover: "#68625E",
    soft: "#F5F5F4",
    border: "#E7E5E4",
  },
} satisfies Record<
  ThemeColor,
  {
    name: string;
    primary: string;
    primaryHover: string;
    soft: string;
    border: string;
  }
>;

export const DEFAULT_APPEARANCE: AppearanceMode = "light";
export const DEFAULT_THEME_COLOR: ThemeColor = "system";

export function isAppearanceMode(value: string | null): value is AppearanceMode {
  return value === "light" || value === "dark";
}

export function isThemeColor(value: string | null): value is ThemeColor {
  return Boolean(value && value in themeColors);
}
