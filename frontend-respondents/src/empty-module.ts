export const useState = () => [null, () => {}]
export const useRef = () => ({ current: null })
export const useEffect = () => {}
export const useCallback = (fn: any) => fn
export const createElement = () => null
export const createContext = () => ({ Provider: () => null, Consumer: () => null })
export default {}