import { createContext, useContext } from 'react'

export const DocumentViewerContext = createContext()

export const useDocmentViewer = () => {
	return useContext(DocumentViewerContext)
}
