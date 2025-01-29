import SignatureTab from './signature-tab'

export const steps = [
	{
		dataElement: 'zoomOverlayButton',
		header: 'Zoom',
		text: 'You can adjust the preview of pdf from here.',
	},
	{
		dataElement: 'toolbarGroup-Forms',
		header: 'Signature field',
		text: 'You can add signature field by enable the form tool.',
	},
	{
		dataElement: 'save-button',
		header: 'Save document',
		text: 'After adding signature field you have to save the document by clicking on save button.',
	},
]

export const signatureViewDisabledElement = [
	'menuButton',
	'leftPanelButton',
	'viewControlsButton',
	'panToolButton',
	'selectToolButton',
	'toolbarGroup-Shapes',
	'toolbarGroup-Edit',
	'toolbarGroup-Insert',
	'toolbarGroup-Annotate',
	'toolbarGroup-View',
	'toolbarGroup-FillAndSign',
	'toolbarGroup-EditText',
	'searchButton',
	'toggleNotesButton',
	'highlightToolGroupButton',
	'underlineToolGroupButton',
	'strikeoutToolGroupButton',
	'squigglyToolGroupButton',
	'stickyToolGroupButton',
	'markInsertTextGroupButton',
	'markReplaceTextGroupButton',
	'shapeToolGroupButton',
	'freeHandToolGroupButton',
	'freeHandHighlightToolGroupButton',
	'freeTextToolGroupButton',
	'eraserToolButton',
	'checkBoxFieldToolGroupButton',
	'radioButtonFieldToolGroupButton',
	'listBoxFieldToolGroupButton',
	'comboBoxFieldToolGroupButton',
	'textFieldToolGroupButton',
	// "toolsOverlay",
	// "signatureFieldToolButton",
	// "signatureFieldToolButton2",
	// "signatureFieldToolButton3",
	// "signatureFieldToolButton4",
	'applyFormFieldButton',
]

export const endFormFieldCreationMode = (formFieldCreationManager) => {
	return new Promise((resolve) => {
		// formFieldCreationManager.applyFormFields()
		if (formFieldCreationManager.isInFormFieldCreationMode()) {
			formFieldCreationManager.endFormFieldCreationMode()
		} else {
			formFieldCreationManager.endFormFieldCreationMode()
		}
		resolve()
	})
}

const saveDocument = async (documentViewer, annotationManager) => {
	try {
		const doc = documentViewer.getDocument()
		const xfdfString = await annotationManager.exportAnnotations()
		const data = await doc.getFileData({ xfdfString })
		const arr = new Uint8Array(data)
		const blob = new Blob([arr], { type: 'application/pdf' })
		// formik.setFieldValue('documentBlob', blob)
		// formik.setFieldValue('status', 1)
		return blob
	} catch (error) {
		return error
	}
}

function countUsertypes(arr) {
	const userTypeCounts = { total: 0 }
	arr.forEach((item) => {
		const match = item.match(/\.([a-zA-Z0-9_]+)\[\d+\]\./)
		if (match) {
			const userType = match[1]
			userTypeCounts[userType] = (userTypeCounts[userType] || 0) + 1
			userTypeCounts.total += 1
		}
	})

	return userTypeCounts
}

export const savePdfDocument = async (instance) => {
	const { documentViewer, annotationManager } = instance.Core
	const fieldManager = annotationManager.getFieldManager()
	const formFieldCreationManager = annotationManager.getFormFieldCreationManager()
	const annotations = annotationManager.getAnnotationsList()

	const signatureFields = []
	const emptySignatureFields = []
	const unnamedSignature = []

	fieldManager.forEachField((field) => {
		if (field?.name === 'signature') {
			signatureFields.push(field.children)
		}
		if (field?.type === 'Sig') {
			emptySignatureFields.push(field)
		}
	})

	annotations.forEach((annot) => {
		if (annot.Author === 'Guest') {
			unnamedSignature.push(annot)
		}
	})

	const isSignatureFieldPresent = signatureFields.flat().length > 0
	const isEmptySignatureFieldPresent = emptySignatureFields.length > 0
	const isUnnamedSignaturePresent = unnamedSignature.length > 0

	if (!isSignatureFieldPresent) {
		throw new Error('Please add at least one signature field to the PDF.')
	}

	if (isEmptySignatureFieldPresent || isUnnamedSignaturePresent) {
		throw new Error('Please select field name in all signature fields.')
	}

	await endFormFieldCreationMode(formFieldCreationManager)

	const signatures = []
	fieldManager.forEachField((field) => {
		if (field?.name === 'signature') {
			field.children.forEach((child) => {
				child.children.forEach((c) => {
					const [$field, userType, $type] = c.name.split('.')
					if ($type === 'signature') {
						signatures.push(c.name)
					}
				})
			})
		}
	})
	const signature_mapping = countUsertypes(signatures)
	const blob = await saveDocument(documentViewer, annotationManager)
	return {
		signature_mapping: signature_mapping,
		blob: blob,
	}
}

export default SignatureTab
