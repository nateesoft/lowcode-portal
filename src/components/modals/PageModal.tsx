import React, { useState, useEffect, useRef, useCallback } from "react"
import {
  X,
  Save,
  Palette,
  Settings,
  FileText,
  Tag,
  Globe,
  Layout,
  Search,
  Wrench,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronRight,
  Component
} from "lucide-react"
import {
  PageData,
  CreatePageRequest,
  componentAPI,
  ComponentData
} from "@/lib/api"
import { useAlert } from "@/contexts/AlertContext"
import { useAuth } from "@/contexts/AuthContext"

interface PageModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (page: CreatePageRequest) => Promise<void>
  editingPage?: PageData | null
  userId?: number
}

const pageTypes = [
  "standard",
  "landing",
  "blog",
  "product",
  "contact",
  "about",
  "portfolio",
  "documentation",
  "support",
  "checkout",
  "other"
]

// HTML Elements grouped for Visual Builder
const htmlElementGroups = [
  {
    name: "Layout Elements",
    icon: Layout,
    elements: [
      {
        id: "div",
        name: "Container (div)",
        icon: Layout,
        tag: "div",
        type: "layout"
      },
      {
        id: "section",
        name: "Section",
        icon: Layout,
        tag: "section",
        type: "layout"
      },
      {
        id: "header",
        name: "Header",
        icon: Layout,
        tag: "header",
        type: "layout"
      },
      { id: "main", name: "Main", icon: Layout, tag: "main", type: "layout" },
      {
        id: "footer",
        name: "Footer",
        icon: Layout,
        tag: "footer",
        type: "layout"
      },
      { id: "aside", name: "Aside", icon: Layout, tag: "aside", type: "layout" }
    ]
  },
  {
    name: "Text Elements",
    icon: FileText,
    elements: [
      {
        id: "h1",
        name: "Heading 1",
        icon: FileText,
        tag: "h1",
        type: "text",
        content: "Heading 1"
      },
      {
        id: "h2",
        name: "Heading 2",
        icon: FileText,
        tag: "h2",
        type: "text",
        content: "Heading 2"
      },
      {
        id: "h3",
        name: "Heading 3",
        icon: FileText,
        tag: "h3",
        type: "text",
        content: "Heading 3"
      },
      {
        id: "p",
        name: "Paragraph",
        icon: FileText,
        tag: "p",
        type: "text",
        content: "Your paragraph text here"
      },
      {
        id: "span",
        name: "Span",
        icon: FileText,
        tag: "span",
        type: "text",
        content: "Text span"
      }
    ]
  },
  {
    name: "Form Elements",
    icon: Settings,
    elements: [
      {
        id: "input",
        name: "Input",
        icon: Settings,
        tag: "input",
        type: "form",
        attributes: { type: "text", placeholder: "Enter text" }
      },
      {
        id: "textarea",
        name: "Textarea",
        icon: Settings,
        tag: "textarea",
        type: "form",
        attributes: { placeholder: "Enter text", rows: "3" }
      },
      {
        id: "select",
        name: "Select",
        icon: Settings,
        tag: "select",
        type: "form"
      },
      {
        id: "button",
        name: "Button",
        icon: Settings,
        tag: "button",
        type: "interactive",
        content: "Click me"
      }
    ]
  },
  {
    name: "Media & Links",
    icon: Globe,
    elements: [
      {
        id: "img",
        name: "Image",
        icon: Globe,
        tag: "img",
        type: "media",
        attributes: { src: "https://via.placeholder.com/150", alt: "Image" }
      },
      {
        id: "a",
        name: "Link",
        icon: Globe,
        tag: "a",
        type: "interactive",
        content: "Link text",
        attributes: { href: "#" }
      }
    ]
  }
]

const PageModal: React.FC<PageModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPage,
  userId = 1
}) => {
  const { showError } = useAlert()
  const { user } = useAuth()
  const [formData, setFormData] = useState<CreatePageRequest>({
    title: "",
    slug: "",
    description: "",
    content: {},
    layout: {},
    components: {},
    styles: {},
    customCSS: "",
    customJS: "",
    status: "draft",
    isPublic: false,
    tags: [],
    seoTitle: "",
    seoDescription: "",
    seoKeywords: [],
    pageType: "standard",
    routePath: "",
    userId: user?.id || userId || 1,
    changeDescription: ""
  })

  const [activeTab, setActiveTab] = useState<
    "basic" | "content" | "design" | "build" | "seo" | "settings"
  >("basic")
  const [tagInput, setTagInput] = useState("")
  const [keywordInput, setKeywordInput] = useState("")
  const [contentText, setContentText] = useState("{}")
  const [layoutText, setLayoutText] = useState("{}")
  const [componentsText, setComponentsText] = useState("{}")
  const [stylesText, setStylesText] = useState("{}")
  // JSONForm Visual Builder states
  const [builderElements, setBuilderElements] = useState<any[]>([])
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({})
  const [customComponents, setCustomComponents] = useState<ComponentData[]>([])
  const [loadingComponents, setLoadingComponents] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [modalSize, setModalSize] = useState({ width: 1200, height: 800 })
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  })
  const modalRef = useRef<HTMLDivElement>(null)

  // Visual Builder functions
  const onDragStart = (e: React.DragEvent, element: any) => {
    e.dataTransfer.setData("application/json", JSON.stringify(element))
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const elementData = JSON.parse(e.dataTransfer.getData("application/json"))
    const newElement = {
      ...elementData,
      id: `${elementData.tag}-${Date.now()}`,
      uniqueId: Date.now()
    }
    setBuilderElements((prev) => [...prev, newElement])
  }

  const removeBuilderElement = (uniqueId: number) => {
    setBuilderElements((prev) => prev.filter((el) => el.uniqueId !== uniqueId))
  }

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName]
    }))
  }

  const loadCustomComponents = useCallback(async () => {
    if (!isOpen || !user?.id) {
      console.log("Skipping component load:", { isOpen, userId: user?.id })
      return
    }

    console.log("Loading custom components...")
    setLoadingComponents(true)
    try {
      const components = await componentAPI.getAll()
      console.log("Raw components from API:", components)
      console.log("Total components received:", components.length)

      // Filter components that are published/public and belong to the user or are public
      const availableComponents = components.filter((comp) => {
        const isAvailable =
          comp.status === "published" ||
          comp.isPublic ||
          comp.userId === user.id
        console.log(
          `Component "${comp.name}": status=${comp.status}, isPublic=${comp.isPublic}, userId=${comp.userId}, currentUserId=${user.id}, available=${isAvailable}`
        )
        return isAvailable
      })

      console.log("Filtered available components:", availableComponents)
      console.log("Available components count:", availableComponents.length)

      // Temporary: Show all components for debugging (remove this later)
      if (availableComponents.length === 0 && components.length > 0) {
        console.log("No components passed filter, showing all for debugging...")
        setCustomComponents(components)
      } else {
        setCustomComponents(availableComponents)
      }
    } catch (error) {
      console.error("Error loading custom components:", error)
      showError("Failed to load custom components")
    } finally {
      setLoadingComponents(false)
    }
  }, [isOpen, user?.id, showError])

  // Load custom components when modal opens
  useEffect(() => {
    loadCustomComponents()
  }, [loadCustomComponents])

  // Center modal when opened
  useEffect(() => {
    if (isOpen && !isFullscreen) {
      const centerX = (window.innerWidth - modalSize.width) / 2
      const centerY = (window.innerHeight - modalSize.height) / 2
      setModalPosition({ x: Math.max(0, centerX), y: Math.max(0, centerY) })
    }
  }, [isOpen, modalSize.width, modalSize.height, isFullscreen])

  useEffect(() => {
    if (editingPage) {
      setFormData({
        title: editingPage.title,
        slug: editingPage.slug,
        description: editingPage.description || "",
        content: editingPage.content || {},
        layout: editingPage.layout || {},
        components: editingPage.components || {},
        styles: editingPage.styles || {},
        customCSS: editingPage.customCSS || "",
        customJS: editingPage.customJS || "",
        status: editingPage.status || "draft",
        isPublic: editingPage.isPublic || false,
        tags: editingPage.tags || [],
        seoTitle: editingPage.seoTitle || "",
        seoDescription: editingPage.seoDescription || "",
        seoKeywords: editingPage.seoKeywords || [],
        pageType: editingPage.pageType || "standard",
        routePath: editingPage.routePath || "",
        userId: user?.id || userId || 1,
        changeDescription: ""
      })
      setContentText(JSON.stringify(editingPage.content || {}, null, 2))
      setLayoutText(JSON.stringify(editingPage.layout || {}, null, 2))
      setComponentsText(JSON.stringify(editingPage.components || {}, null, 2))
      setStylesText(JSON.stringify(editingPage.styles || {}, null, 2))
      
      // Load builderElements from saved content if available
      if (editingPage.content && editingPage.content.buildData && editingPage.content.buildData.builderElements) {
        setBuilderElements(editingPage.content.buildData.builderElements)
        console.log('Loaded builderElements from saved page:', editingPage.content.buildData.builderElements)
      }
    } else {
      // Reset for new page
      setFormData({
        title: "",
        slug: "",
        description: "",
        content: {},
        layout: {},
        components: {},
        styles: {},
        customCSS: "",
        customJS: "",
        status: "draft",
        isPublic: false,
        tags: [],
        seoTitle: "",
        seoDescription: "",
        seoKeywords: [],
        pageType: "standard",
        routePath: "",
        userId: user?.id || userId || 1,
        changeDescription: ""
      })
      setContentText("{}")
      setLayoutText("{}")
      setComponentsText("{}")
      setStylesText("{}")
      
      // Reset builderElements for new page
      setBuilderElements([])
    }
    setTagInput("")
    setKeywordInput("")
    // Reset modal state when opening
    if (isOpen) {
      setIsFullscreen(false)
      setModalSize({ width: 1200, height: 800 })
    }
  }, [editingPage, userId, isOpen])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim()
  }

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: !editingPage ? generateSlug(title) : prev.slug // Only auto-generate for new pages
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Parse JSON fields
      let content = {}
      let layout = {}
      let components = {}
      let styles = {}

      try {
        content = JSON.parse(contentText)
      } catch (e) {
        showError("Invalid JSON in content field")
        setIsLoading(false)
        return
      }

      try {
        layout = JSON.parse(layoutText)
      } catch (e) {
        showError("Invalid JSON in layout field")
        setIsLoading(false)
        return
      }

      try {
        components = JSON.parse(componentsText)
      } catch (e) {
        showError("Invalid JSON in components field")
        setIsLoading(false)
        return
      }

      try {
        styles = JSON.parse(stylesText)
      } catch (e) {
        showError("Invalid JSON in styles field")
        setIsLoading(false)
        return
      }

      // Prepare builderElements data from Build tab
      const buildData = {
        builderElements: builderElements,
        elementsCount: builderElements.length,
        lastModified: new Date().toISOString()
      }

      const pageData = {
        ...formData,
        userId: user?.id || userId || 1, // Ensure we use current user ID
        content: {
          ...content,
          buildData: buildData
        },
        layout,
        components,
        styles,
        changeDescription:
          formData.changeDescription ||
          (editingPage ? "Page updated" : "Page created")
      }

      console.log("Saving page with data:", pageData) // Debug logging
      console.log("Build tab data being saved:", buildData) // Debug build data
      console.log("Total builderElements:", builderElements.length) // Debug elements count
      
      await onSave(pageData)
      onClose()
    } catch (error: any) {
      console.error("Error saving page:", error)
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })

      // Show more detailed error message
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to save page"
      showError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || []
    }))
  }

  const addKeyword = () => {
    if (
      keywordInput.trim() &&
      !formData.seoKeywords?.includes(keywordInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        seoKeywords: [...(prev.seoKeywords || []), keywordInput.trim()]
      }))
      setKeywordInput("")
    }
  }

  const removeKeyword = (keywordToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      seoKeywords:
        prev.seoKeywords?.filter((keyword) => keyword !== keywordToRemove) || []
    }))
  }

  // Drag functionality
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isFullscreen) return
      setIsDragging(true)
      setDragStart({
        x: e.clientX - modalPosition.x,
        y: e.clientY - modalPosition.y
      })
    },
    [isFullscreen, modalPosition]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && !isFullscreen) {
        const newX = e.clientX - dragStart.x
        const newY = e.clientY - dragStart.y
        setModalPosition({
          x: Math.max(0, Math.min(newX, window.innerWidth - modalSize.width)),
          y: Math.max(0, Math.min(newY, window.innerHeight - modalSize.height))
        })
      }
      if (isResizing && !isFullscreen) {
        const deltaX = e.clientX - resizeStart.x
        const deltaY = e.clientY - resizeStart.y
        const newWidth = Math.max(800, resizeStart.width + deltaX)
        const newHeight = Math.max(600, resizeStart.height + deltaY)
        setModalSize({ width: newWidth, height: newHeight })
      }
    },
    [isDragging, isResizing, isFullscreen, dragStart, resizeStart, modalSize]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
  }, [])

  // Resize functionality
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      if (isFullscreen) return
      e.stopPropagation()
      setIsResizing(true)
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: modalSize.width,
        height: modalSize.height
      })
    },
    [isFullscreen, modalSize]
  )

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen)
    if (!isFullscreen) {
      // Save current size and position before going fullscreen
      setModalPosition({ x: 0, y: 0 })
    }
  }, [isFullscreen])

  // Add event listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = isDragging ? "move" : "nw-resize"
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.body.style.cursor = "default"
      }
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 p-4">
      <div
        ref={modalRef}
        className={`bg-white dark:bg-slate-800 rounded-lg shadow-xl flex flex-col ${
          isFullscreen ? "fixed inset-4" : "absolute"
        }`}
        style={
          isFullscreen
            ? {}
            : {
                width: modalSize.width,
                height: modalSize.height,
                left: modalPosition.x,
                top: modalPosition.y
              }
        }
      >
        <div
          className={`flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 ${
            !isFullscreen ? "cursor-move" : ""
          }`}
          onMouseDown={handleMouseDown}
        >
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white select-none">
            {editingPage ? "Edit Page" : "Create New Page"}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullscreen}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex-shrink-0 flex border-b border-slate-200 dark:border-slate-700">
          {[
            { key: "basic", label: "Basic Info", icon: FileText },
            { key: "content", label: "Content", icon: Layout },
            { key: "design", label: "Design", icon: Palette },
            { key: "build", label: "Build", icon: Wrench },
            { key: "seo", label: "SEO", icon: Search },
            { key: "settings", label: "Settings", icon: Settings }
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm transition ${
                activeTab === tab.key
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto p-6">
              {/* Basic Info Tab */}
              {activeTab === "basic" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Page Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                        placeholder="Enter page title"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Slug *
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({ ...formData, slug: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                        placeholder="page-slug"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Page Type *
                      </label>
                      <select
                        value={formData.pageType}
                        onChange={(e) =>
                          setFormData({ ...formData, pageType: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                        required
                      >
                        {pageTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                      rows={3}
                      placeholder="Describe what this page is about..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Route Path
                    </label>
                    <input
                      type="text"
                      value={formData.routePath}
                      onChange={(e) =>
                        setFormData({ ...formData, routePath: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                      placeholder="/path/to/page"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addTag())
                        }
                        className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                        placeholder="Add a tag..."
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Tab */}
              {activeTab === "content" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Page Content (JSON)
                      </label>
                      <textarea
                        value={contentText}
                        onChange={(e) => setContentText(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white font-mono text-sm"
                        rows={8}
                        placeholder='{\n  "sections": [],\n  "blocks": []\n}'
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Layout Configuration (JSON)
                      </label>
                      <textarea
                        value={layoutText}
                        onChange={(e) => setLayoutText(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white font-mono text-sm"
                        rows={8}
                        placeholder='{\n  "type": "standard",\n  "header": true,\n  "footer": true\n}'
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Components Map (JSON)
                      </label>
                      <textarea
                        value={componentsText}
                        onChange={(e) => setComponentsText(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white font-mono text-sm"
                        rows={6}
                        placeholder='{\n  "hero": "hero-component-1",\n  "footer": "footer-component-2"\n}'
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Page Styles (JSON)
                      </label>
                      <textarea
                        value={stylesText}
                        onChange={(e) => setStylesText(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white font-mono text-sm"
                        rows={6}
                        placeholder='{\n  "theme": "modern",\n  "primaryColor": "#007bff"\n}'
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Design Tab */}
              {activeTab === "design" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Custom CSS
                    </label>
                    <textarea
                      value={formData.customCSS}
                      onChange={(e) =>
                        setFormData({ ...formData, customCSS: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white font-mono text-sm"
                      rows={8}
                      placeholder="/* Add your custom CSS here */&#10;.my-class {&#10;  color: blue;&#10;}"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Custom JavaScript
                    </label>
                    <textarea
                      value={formData.customJS}
                      onChange={(e) =>
                        setFormData({ ...formData, customJS: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white font-mono text-sm"
                      rows={8}
                      placeholder="// Add your custom JavaScript here&#10;document.addEventListener('DOMContentLoaded', function() {&#10;  console.log('Page loaded');&#10;});"
                    />
                  </div>
                </div>
              )}

              {/* Build Tab - Visual Builder */}
              {activeTab === "build" && (
                <div className="flex-1 overflow-hidden flex">
                  {/* Left Panel - Tools */}
                  <div className="w-64 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col">
                    <div className="p-4 flex-1 overflow-y-auto">
                      <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                        HTML Elements
                      </h3>

                      <div className="space-y-3">
                        {/* HTML Element Groups */}
                        {htmlElementGroups.map((group) => {
                          const GroupIcon = group.icon
                          const isCollapsed = collapsedGroups[group.name]

                          return (
                            <div
                              key={group.name}
                              className="border border-slate-200 dark:border-slate-600 rounded-lg"
                            >
                              {/* Group Header */}
                              <button
                                onClick={() => toggleGroup(group.name)}
                                className="w-full flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-t-lg transition-colors"
                              >
                                <div className="flex items-center space-x-2">
                                  <GroupIcon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                    {group.name}
                                  </span>
                                </div>
                                {isCollapsed ? (
                                  <ChevronRight className="h-4 w-4 text-slate-500" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-slate-500" />
                                )}
                              </button>

                              {/* Group Elements */}
                              {!isCollapsed && (
                                <div className="p-2 space-y-1">
                                  {group.elements.map((element) => {
                                    const IconComponent = element.icon
                                    return (
                                      <div
                                        key={element.id}
                                        draggable
                                        onDragStart={(e) =>
                                          onDragStart(e, element)
                                        }
                                        className="flex items-center space-x-2 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded cursor-move hover:border-slate-400 dark:hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                      >
                                        <IconComponent className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                                        <span className="text-xs text-slate-700 dark:text-slate-300">
                                          {element.name}
                                        </span>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        })}

                        {/* Custom Components Group */}
                        <div className="border border-slate-200 dark:border-slate-600 rounded-lg">
                          {/* Group Header */}
                          <button
                            onClick={() => toggleGroup("Custom Components")}
                            className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 hover:from-purple-200 hover:to-blue-200 dark:hover:from-purple-800/30 dark:hover:to-blue-800/30 rounded-t-lg transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <Component className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                                Custom Components
                              </span>
                              {loadingComponents && (
                                <div className="w-3 h-3 border border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                              )}
                            </div>
                            {collapsedGroups["Custom Components"] ? (
                              <ChevronRight className="h-4 w-4 text-purple-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-purple-500" />
                            )}
                          </button>

                          {/* Custom Components List */}
                          {!collapsedGroups["Custom Components"] && (
                            <div className="p-2 space-y-1">
                              {customComponents.length === 0 ? (
                                <div className="p-3 text-center text-xs text-slate-500 dark:text-slate-400">
                                  {loadingComponents
                                    ? "Loading components..."
                                    : "No custom components available"}
                                </div>
                              ) : (
                                customComponents.map((component) => {
                                  // Safely parse JSON data with error handling
                                  let parsedSchema = {}
                                  let parsedUiSchema = {}
                                  let parsedFormData = {}
                                  
                                  try {
                                    parsedSchema = component.jsonSchema 
                                      ? JSON.parse(component.jsonSchema) 
                                      : {}
                                  } catch (error) {
                                    console.warn(`Failed to parse jsonSchema for component ${component.name}:`, error)
                                    parsedSchema = {}
                                  }
                                  
                                  try {
                                    parsedUiSchema = component.uiSchema 
                                      ? JSON.parse(component.uiSchema) 
                                      : {}
                                  } catch (error) {
                                    console.warn(`Failed to parse uiSchema for component ${component.name}:`, error)
                                    parsedUiSchema = {}
                                  }
                                  
                                  try {
                                    parsedFormData = component.formData 
                                      ? JSON.parse(component.formData) 
                                      : {}
                                  } catch (error) {
                                    console.warn(`Failed to parse formData for component ${component.name}:`, error)
                                    parsedFormData = {}
                                  }
                                  
                                  const componentElement = {
                                    id: `custom-${component.id}`,
                                    name: component.name,
                                    tag: "JsonForm",
                                    type: "jsonform",
                                    content: `<JsonForm 
  schema={${JSON.stringify(parsedSchema, null, 2)}}
  uiSchema={${JSON.stringify(parsedUiSchema, null, 2)}}
  formData={${JSON.stringify(parsedFormData, null, 2)}}
  onChange={(data) => console.log('Form data changed:', data)}
  onSubmit={(data) => console.log('Form submitted:', data)}
/>`,
                                    customComponent: true,
                                    componentData: component,
                                    // Store parsed data for easy access
                                    schema: parsedSchema,
                                    uiSchema: parsedUiSchema,
                                    formData: parsedFormData
                                  }

                                  return (
                                    <div
                                      key={component.id}
                                      draggable
                                      onDragStart={(e) =>
                                        onDragStart(e, componentElement)
                                      }
                                      className="flex items-center space-x-2 p-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-600 rounded cursor-move hover:border-purple-400 dark:hover:border-purple-400 hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-800/30 dark:hover:to-blue-800/30 transition-colors"
                                    >
                                      <Component className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                                      <div className="flex-1">
                                        <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                                          {component.name}
                                        </span>
                                        <div className="text-xs text-purple-500 dark:text-purple-400">
                                          {component.type} •{" "}
                                          {component.category}
                                        </div>
                                        {component.description && (
                                          <div className="text-xs text-purple-400 dark:text-purple-500 truncate mt-1">
                                            {component.description}
                                          </div>
                                        )}
                                      </div>
                                      {component.isPublic && (
                                        <div
                                          className="w-2 h-2 bg-green-500 rounded-full"
                                          title="Public component"
                                        ></div>
                                      )}
                                    </div>
                                  )
                                })
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Center Panel - Canvas/Drop Area */}
                  <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-700">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Canvas
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Drag elements here to build your page
                          </p>
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          Elements: {builderElements.length}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 p-4">
                      <div
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                        className={`h-full border-2 border-dashed rounded-lg p-4 transition-colors overflow-y-auto ${
                          builderElements.length === 0
                            ? "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        }`}
                      >
                        {builderElements.length === 0 ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                              <Layout className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                Drag & Drop Elements
                              </h3>
                              <p className="text-slate-500 dark:text-slate-400">
                                Drag elements from the left panel to build your
                                page
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3 sticky top-0 bg-white dark:bg-slate-800 pb-2 border-b border-slate-200 dark:border-slate-700">
                              Canvas Elements
                            </h4>
                            {builderElements.map((element) => {
                              // Get icon component based on element type
                              const getIconComponent = (element: any) => {
                                // Handle custom components
                                if (element.customComponent) {
                                  return Component
                                }

                                // Handle regular HTML elements
                                const iconMap: Record<
                                  string,
                                  React.ComponentType<{ className?: string }>
                                > = {
                                  div: Layout,
                                  section: Layout,
                                  header: Layout,
                                  main: Layout,
                                  h1: FileText,
                                  h2: FileText,
                                  h3: FileText,
                                  p: FileText,
                                  span: FileText,
                                  button: Settings,
                                  input: Settings,
                                  textarea: Settings,
                                  select: Settings,
                                  img: FileText,
                                  a: FileText
                                }
                                return iconMap[element.tag] || FileText
                              }

                              const IconComponent = getIconComponent(element)

                              return (
                                <div
                                  key={element.uniqueId}
                                  className={`flex items-center justify-between p-3 border rounded-lg hover:border-slate-400 dark:hover:border-slate-400 transition-colors ${
                                    element.customComponent
                                      ? "bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-600"
                                      : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                                  }`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <IconComponent
                                      className={`h-4 w-4 ${
                                        element.customComponent
                                          ? "text-purple-600 dark:text-purple-400"
                                          : "text-slate-600 dark:text-slate-300"
                                      }`}
                                    />
                                    <div>
                                      <div
                                        className={`text-sm font-medium ${
                                          element.customComponent
                                            ? "text-purple-900 dark:text-purple-100"
                                            : "text-slate-900 dark:text-white"
                                        }`}
                                      >
                                        {element.name}
                                        {element.customComponent && (
                                          <span className="ml-2 text-xs px-2 py-0.5 bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded-full">
                                            Custom
                                          </span>
                                        )}
                                      </div>
                                      <div
                                        className={`text-xs ${
                                          element.customComponent
                                            ? "text-purple-600 dark:text-purple-400"
                                            : "text-slate-500 dark:text-slate-400"
                                        }`}
                                      >
                                        {element.customComponent
                                          ? element.type === "jsonform"
                                            ? `JsonForm • ${
                                                element.componentData
                                                  ?.category || "Form"
                                              }`
                                            : element.componentData?.type ||
                                              "Custom Component"
                                          : element.content ||
                                            `<${element.tag}>`}
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() =>
                                      removeBuilderElement(element.uniqueId)
                                    }
                                    className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Panel - Live Preview */}
                  <div className="w-96 bg-slate-50 dark:bg-slate-700 flex flex-col">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Preview
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <div className="h-full overflow-y-auto p-4">
                        {builderElements.length === 0 ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                              <Globe className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                              <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                                No Preview Available
                              </h4>
                              <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Add elements to the canvas to see the live
                                preview
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {builderElements.map((element) => {
                              // Render JsonForm components
                              if (
                                element.type === "jsonform" &&
                                element.customComponent &&
                                element.componentData
                              ) {
                                const component = element.componentData
                                let schema: any = {}
                                let uiSchema: any = {}
                                let formData: any = {}

                                const { jsonSchema: schemaComponent, uiSchema: uiSchemaComponent } = component?.props
                                // Use pre-parsed data from element if available
                                if (schemaComponent && Object.keys(schemaComponent).length > 0) {
                                  schema = schemaComponent
                                } else {
                                  // Try to parse from component data
                                  try {
                                    if (
                                      component.jsonSchema &&
                                      component.jsonSchema.trim() !== "{}" &&
                                      component.jsonSchema.trim() !== ""
                                    ) {
                                      schema = JSON.parse(component.jsonSchema)
                                    } else {
                                      // Fallback schema สำหรับ demo
                                      schema = {
                                        type: "object",
                                        title: component.name + " Form",
                                        properties: {
                                          name: {
                                            type: "string",
                                            title: "Name"
                                          },
                                          email: {
                                            type: "string",
                                            title: "Email",
                                            format: "email"
                                          },
                                          message: {
                                            type: "string",
                                            title: "Message",
                                            format: "textarea"
                                          }
                                        },
                                        required: ["name", "email"]
                                      }
                                    }
                                  } catch (error) {
                                    console.error("Error parsing jsonSchema:", error)
                                    schema = {}
                                  }
                                }

                                // Use pre-parsed uiSchema from element if available
                                if (uiSchemaComponent && Object.keys(uiSchemaComponent).length > 0) {
                                  uiSchema = uiSchemaComponent
                                } else {
                                  // Try to parse from component data
                                  try {
                                    if (
                                      component.uiSchema &&
                                      component.uiSchema.trim() !== "{}" &&
                                      component.uiSchema.trim() !== ""
                                    ) {
                                      uiSchema = JSON.parse(component.uiSchema)
                                    } else {
                                      // Fallback uiSchema สำหรับ demo
                                      uiSchema = {
                                        name: {
                                          "ui:placeholder": "Enter your full name"
                                        },
                                        email: {
                                          "ui:placeholder":
                                            "Enter your email address"
                                        },
                                        message: {
                                          "ui:widget": "textarea",
                                          "ui:placeholder": "Enter your message",
                                          "ui:options": {
                                            rows: 4
                                          }
                                        }
                                      }
                                    }
                                  } catch (error) {
                                    console.error("Error parsing uiSchema:", error)
                                    uiSchema = {}
                                  }
                                }

                                // Use pre-parsed formData from element if available
                                if (element.formData && Object.keys(element.formData).length > 0) {
                                  formData = element.formData
                                } else {
                                  // Try to parse from component data
                                  try {
                                    if (
                                      component.formData &&
                                      component.formData.trim() !== "{}" &&
                                      component.formData.trim() !== ""
                                    ) {
                                      formData = JSON.parse(component.formData)
                                    }
                                  } catch (error) {
                                    console.error("Error parsing formData:", error)
                                    formData = {}
                                  }
                                }

                                return (
                                  <div
                                    key={element.uniqueId}
                                    className="border border-purple-200 dark:border-purple-600 rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20"
                                  >
                                    <div className="flex items-center space-x-2 mb-3">
                                      <Component className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                      <h4 className="text-sm font-medium text-purple-800 dark:text-purple-200">
                                        {component.name}
                                      </h4>
                                      <span className="text-xs px-2 py-1 bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded">
                                        JsonForm Component
                                      </span>
                                    </div>
                                    {component.description && (
                                      <p className="text-sm text-purple-600 dark:text-purple-400 mb-3">
                                        {component.description}
                                      </p>
                                    )}

                                    {/* JsonForm Preview */}
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded border">
                                      {Object.keys(schema).length > 0 ? (
                                        <div className="text-sm text-slate-600 dark:text-slate-400">
                                          <p className="font-medium mb-2">
                                            Live JsonForm Preview:
                                          </p>
                                          {/* Recursive function to render layouts */}
                                          {(() => {
                                            const renderLayoutElement = (element: any, depth: number = 0, path: string = "0"): React.ReactNode => {
                                              // Handle nested layouts (HorizontalLayout, VerticalLayout)
                                              if (element.type === "HorizontalLayout" || element.type === "VerticalLayout") {
                                                return (
                                                  <div key={`layout-${element.type}-${path}-${depth}`} className="mb-4">
                                                    {depth === 0 && (
                                                      <div className="flex items-center gap-2 mb-3 text-xs">
                                                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                                                          <Layout className="h-3 w-3 mr-1" />
                                                          {element.type === "HorizontalLayout" ? "Horizontal" : "Vertical"} Layout
                                                        </span>
                                                        <span className="text-slate-500 dark:text-slate-400">
                                                          {element.elements?.length || 0} elements
                                                        </span>
                                                      </div>
                                                    )}
                                                    {depth > 0 && (
                                                      <div className="mb-2 text-xs">
                                                        <span className="inline-flex items-center px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs">
                                                          Nested {element.type === "HorizontalLayout" ? "Horizontal" : "Vertical"}
                                                        </span>
                                                      </div>
                                                    )}
                                                    <div className={`${
                                                      element.type === "HorizontalLayout" 
                                                        ? "flex flex-row gap-3 flex-wrap" 
                                                        : "flex flex-col space-y-2"
                                                    } ${depth > 0 ? "p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-25 dark:bg-slate-800/50" : ""}`}>
                                                      {element.elements && element.elements.map((childElement: any, index: number) => 
                                                        renderLayoutElement(childElement, depth + 1, `${path}-${index}`)
                                                      )}
                                                    </div>
                                                  </div>
                                                )
                                              }
                                              
                                              // Handle Control elements
                                              if (element.type === "Control" && element.scope) {
                                                const propertyKey = element.scope.split('/').pop()
                                                const property = schema.properties?.[propertyKey]
                                                
                                                if (!property) return null
                                                
                                                const defaultValue = formData[propertyKey] || ""
                                                const isNested = depth > 0
                                                
                                                return (
                                                  <div key={`control-${propertyKey}-${path}-${depth}`} className={`${
                                                    isNested 
                                                      ? "flex-1 min-w-0 p-2 bg-white dark:bg-slate-700 rounded border" 
                                                      : "p-2 bg-slate-50 dark:bg-slate-700 rounded"
                                                  }`}>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                      {property.title || propertyKey}
                                                      {schema.required?.includes(propertyKey) && <span className="text-red-500 ml-1">*</span>}
                                                    </label>
                                                    
                                                    {property.type === "string" && !property.enum && (
                                                      <input
                                                        type={property.format === "email" ? "email" : "text"}
                                                        placeholder={`Enter ${property.title || propertyKey}`}
                                                        className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                                        defaultValue={defaultValue}
                                                        disabled
                                                      />
                                                    )}
                                                    {property.type === "number" && (
                                                      <input
                                                        type="number"
                                                        className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                                        defaultValue={defaultValue}
                                                        disabled
                                                      />
                                                    )}
                                                    {property.type === "boolean" && (
                                                      <div className="flex items-center space-x-2">
                                                        <input
                                                          type="checkbox"
                                                          disabled
                                                          className="rounded"
                                                          defaultChecked={defaultValue}
                                                        />
                                                        <span className="text-sm">{property.title || propertyKey}</span>
                                                      </div>
                                                    )}
                                                    {property.enum && (
                                                      <select
                                                        className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                                        disabled
                                                        defaultValue={defaultValue}
                                                      >
                                                        <option value="">Select {property.title || propertyKey}</option>
                                                        {property.enum.map((option: any) => (
                                                          <option key={option} value={option}>{option}</option>
                                                        ))}
                                                      </select>
                                                    )}
                                                  </div>
                                                )
                                              }
                                              
                                              // Handle other element types (Group, Label, etc.)
                                              if (element.type === "Group" && element.elements) {
                                                return (
                                                  <div key={`group-${path}-${depth}`} className="mb-3 p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800/30">
                                                    {element.label && (
                                                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{element.label}</h4>
                                                    )}
                                                    <div className="space-y-2">
                                                      {element.elements.map((childElement: any, index: number) => 
                                                        renderLayoutElement(childElement, depth + 1, `${path}-group-${index}`)
                                                      )}
                                                    </div>
                                                  </div>
                                                )
                                              }
                                              
                                              return null
                                            }
                                            
                                            // Check if uiSchema has layout structure
                                            return uiSchema && (uiSchema.type === "HorizontalLayout" || uiSchema.type === "VerticalLayout") 
                                              ? renderLayoutElement(uiSchema, 0, "root")
                                              : (
                                                /* Render standard property-based forms */
                                                schema.properties && Object.keys(schema.properties).map((key) => {
                                                  const property = schema.properties[key]
                                                  const uiConfig = uiSchema[key] || {}
                                                  const placeholder = uiConfig["ui:placeholder"] || `Enter ${property.title || key}`
                                                  const widget = uiConfig["ui:widget"]
                                                  const options = uiConfig["ui:options"] || {}
                                                  const defaultValue = formData[key] || ""
                                                  
                                                  return (
                                                    <div key={key} className="mb-3 p-2 bg-slate-50 dark:bg-slate-700 rounded">
                                                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                        {property.title || key}
                                                        {schema.required?.includes(key) && <span className="text-red-500 ml-1">*</span>}
                                                      </label>
                                                      
                                                      {property.type === "string" && widget === "textarea" && (
                                                        <textarea
                                                          placeholder={placeholder}
                                                          className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                                                          rows={options.rows || 3}
                                                          defaultValue={defaultValue}
                                                          disabled
                                                        />
                                                      )}
                                                      {property.type === "string" && widget !== "textarea" && !property.enum && (
                                                        <input
                                                          type={property.format === "email" ? "email" : "text"}
                                                          placeholder={placeholder}
                                                          className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                                          defaultValue={defaultValue}
                                                          disabled
                                                        />
                                                      )}
                                                      {property.type === "number" && (
                                                        <input
                                                          type="number"
                                                          placeholder={placeholder}
                                                          className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                                          defaultValue={defaultValue}
                                                          disabled
                                                        />
                                                      )}
                                                      {property.type === "boolean" && (
                                                        <div className="flex items-center space-x-2">
                                                          <input
                                                            type="checkbox"
                                                            disabled
                                                            className="rounded"
                                                            defaultChecked={defaultValue}
                                                          />
                                                          <span className="text-sm">{property.title || key}</span>
                                                        </div>
                                                      )}
                                                      {property.enum && (
                                                        <select
                                                          className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                                          disabled
                                                          defaultValue={defaultValue}
                                                        >
                                                          <option value="">Select {property.title || key}</option>
                                                          {property.enum.map((option: any) => (
                                                            <option key={option} value={option}>{option}</option>
                                                          ))}
                                                        </select>
                                                      )}
                                                      
                                                      {Object.keys(uiConfig).length > 0 && (
                                                        <div className="mt-1 text-xs text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-1 rounded">
                                                          UI Config: {JSON.stringify(uiConfig, null, 0)}
                                                        </div>
                                                      )}
                                                    </div>
                                                  )
                                                })
                                              )
                                          })()}
                                        </div>
                                      ) : (
                                        <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                                          <p>No form schema defined</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )
                              }

                              // Render custom components (non-JsonForm)
                              if (
                                element.customComponent &&
                                element.componentData
                              ) {
                                const component = element.componentData
                                return (
                                  <div
                                    key={element.uniqueId}
                                    className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 bg-slate-50 dark:bg-slate-700"
                                  >
                                    <div className="flex items-center space-x-2 mb-3">
                                      <Component className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                      <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                        {component.name}
                                      </h4>
                                      <span className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded">
                                        Custom Component
                                      </span>
                                    </div>
                                    {component.description && (
                                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                        {component.description}
                                      </p>
                                    )}

                                    <div className="bg-white dark:bg-slate-800 p-3 rounded border">
                                      {component.template ? (
                                        <div
                                          dangerouslySetInnerHTML={{
                                            __html: component.template
                                          }}
                                        />
                                      ) : (
                                        <p className="text-slate-500 dark:text-slate-400 italic">
                                          No template content
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )
                              }

                              // Render regular HTML elements
                              const attributes = element.attributes || {}
                              const Tag =
                                element.tag as keyof React.JSX.IntrinsicElements

                              return (
                                <div
                                  key={element.uniqueId}
                                  className="border border-slate-200 dark:border-slate-600 rounded-lg p-3 bg-white dark:bg-slate-800"
                                >
                                  <div className="flex items-center space-x-2 mb-2">
                                    <FileText className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                      {element.name} ({element.tag})
                                    </span>
                                  </div>
                                  <div className="preview-element">
                                    {["input", "img"].includes(element.tag) ? (
                                      <Tag {...attributes} className="block" />
                                    ) : (
                                      <Tag {...attributes} className="block">
                                        {element.content ||
                                          `Sample ${element.tag} content`}
                                      </Tag>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SEO Tab */}
              {activeTab === "seo" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={formData.seoTitle}
                      onChange={(e) =>
                        setFormData({ ...formData, seoTitle: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                      placeholder="SEO optimized title for search engines"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      SEO Description
                    </label>
                    <textarea
                      value={formData.seoDescription}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          seoDescription: e.target.value
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                      rows={3}
                      placeholder="SEO meta description (150-160 characters recommended)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      SEO Keywords
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.seoKeywords?.map((keyword) => (
                        <span
                          key={keyword}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => removeKeyword(keyword)}
                            className="ml-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex">
                      <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addKeyword())
                        }
                        className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                        placeholder="Add SEO keyword..."
                      />
                      <button
                        type="button"
                        onClick={addKeyword}
                        className="px-4 py-2 bg-green-600 text-white rounded-r-lg hover:bg-green-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-slate-500 mr-3" />
                      <div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                          Public Page
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Make this page accessible to all users
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isPublic: e.target.checked
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Change Description
                    </label>
                    <input
                      type="text"
                      value={formData.changeDescription}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          changeDescription: e.target.value
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                      placeholder="Describe what changed in this version..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 flex justify-end space-x-3 p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Page"}
              </button>
            </div>
          </form>
        </div>
        {/* Resize handle */}
        {!isFullscreen && (
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize"
            onMouseDown={handleResizeStart}
          >
            <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-slate-400"></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PageModal
