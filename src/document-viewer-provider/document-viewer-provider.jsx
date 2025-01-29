import { useState } from 'react'
import { DocumentViewerContext } from './document-viewer-context'
import { DocumentViewerUpdater } from './document-viewer-updater'

export const DocumentViewerProvider = ({ children }) => {
	const [documentViewer, setDocumentViewer] = useState(null)

	const onSetDocumentViewer = (value) => {
		setDocumentViewer(value)
	}

	return (
		<DocumentViewerContext.Provider value={documentViewer}>
			<DocumentViewerUpdater.Provider value={onSetDocumentViewer}>
				{children}
			</DocumentViewerUpdater.Provider>
		</DocumentViewerContext.Provider>
	)
}
