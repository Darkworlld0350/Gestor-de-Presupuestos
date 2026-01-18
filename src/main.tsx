import { ThemeProvider } from "./presentation/theme/useThemeContext";
import HomeScreen from "./presentation/screens/HomeScreen";

export default function App() {
  return (
    <ThemeProvider>
      <HomeScreen />
    </ThemeProvider>
  );
}
