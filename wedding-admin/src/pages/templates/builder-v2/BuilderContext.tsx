import { createContext, useContext } from 'react';
import type { GlobalStyles } from '../../../types/builderConfig';
import { DEFAULT_GLOBAL_STYLES } from '../../../types/builderConfig';

/**
 * Context shared between BuilderV2Page and all block renderers inside Puck.
 * Puck doesn't natively support passing custom props to component renderers,
 * so we use React Context to bridge globalStyles + editor callbacks.
 */
interface BuilderContextValue {
  globalStyles: GlobalStyles;
  /** ID of currently selected element (for inspector highlight) */
  selectedElementId: string | null;
  onSelectElement: (elementId: string) => void;
}

const BuilderContext = createContext<BuilderContextValue>({
  globalStyles: DEFAULT_GLOBAL_STYLES,
  selectedElementId: null,
  onSelectElement: () => {},
});

export const BuilderProvider = BuilderContext.Provider;

export function useBuilderContext() {
  return useContext(BuilderContext);
}
