import { createContext, useContext } from 'react'

export const DocumentViewerUpdater = createContext()

export const useSetDocumentViewer = () => {
	return useContext(DocumentViewerUpdater)
}
