import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { 
  Upload, 
  Download, 
  Zap, 
  Star, 
  MousePointer, 
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  Check,
  X,
  AlertCircle
} from 'lucide-react'
import './App.css'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [processedImage, setProcessedImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = useCallback((file) => {
    if (file && file.type.startsWith('image/')) {
      // التحقق من حجم الملف (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('حجم الملف كبير جداً. الحد الأقصى 10MB')
        return
      }
      
      setSelectedFile(file)
      setProcessedImage(null)
      setProgress(0)
      setError(null)
    } else {
      setError('يرجى اختيار ملف صورة صالح')
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0]
    handleFileSelect(file)
  }, [handleFileSelect])

  const processImage = useCallback(async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setProgress(0)
    setError(null)

    try {
      // إنشاء FormData لإرسال الصورة
      const formData = new FormData()
      formData.append('image', selectedFile)

      // محاكاة شريط التقدم
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 15
        })
      }, 200)

      // إرسال الطلب إلى API
      const response = await fetch('/api/remove-background', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'حدث خطأ أثناء معالجة الصورة')
      }

      const result = await response.json()
      
      if (result.success) {
        setProgress(100)
        setProcessedImage(result.image)
      } else {
        throw new Error(result.error || 'فشل في معالجة الصورة')
      }
    } catch (error) {
      console.error('Error processing image:', error)
      setError(error.message || 'حدث خطأ أثناء معالجة الصورة')
    } finally {
      setIsProcessing(false)
    }
  }, [selectedFile])

  const downloadImage = useCallback(() => {
    if (processedImage) {
      // تحويل base64 إلى blob
      const byteCharacters = atob(processedImage.split(',')[1])
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/png' })
      
      // إنشاء رابط التحميل
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `background-removed-${Date.now()}.png`
      link.click()
      URL.revokeObjectURL(url)
    }
  }, [processedImage])

  const resetApp = useCallback(() => {
    setSelectedFile(null)
    setProcessedImage(null)
    setProgress(0)
    setIsProcessing(false)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Background Remover</h1>
                <p className="text-sm text-gray-600">إزالة الخلفية بالذكاء الاصطناعي</p>
              </div>
            </div>
            <Button variant="outline" onClick={resetApp}>
              <X className="w-4 h-4 mr-2" />
              إعادة تعيين
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              إزالة الخلفية من الصور
              <span className="block text-transparent bg-clip-text gradient-bg mt-2">
                بالذكاء الاصطناعي
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              أداة احترافية وسريعة لإزالة الخلفيات من الصور بجودة عالية في ثوانٍ معدودة
            </p>
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setError(null)}
                className="ml-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <section className="mb-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              {!selectedFile ? (
                <div
                  className={`upload-zone rounded-lg p-12 text-center cursor-pointer ${
                    dragOver ? 'dragover' : ''
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    اسحب وأفلت صورتك هنا
                  </h3>
                  <p className="text-gray-600 mb-4">
                    أو انقر لاختيار ملف من جهازك
                  </p>
                  <Button className="btn-primary text-white">
                    <Upload className="w-4 h-4 mr-2" />
                    اختيار صورة
                  </Button>
                  <p className="text-sm text-gray-500 mt-4">
                    يدعم: JPG, PNG, JPEG, GIF, BMP, WEBP (حتى 10MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Image Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">الصورة الأصلية</h4>
                      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          alt="Original"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    
                    {processedImage && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900">بعد إزالة الخلفية</h4>
                        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <div className="absolute inset-0 bg-transparent bg-[linear-gradient(45deg,#f0f0f0_25%,transparent_25%),linear-gradient(-45deg,#f0f0f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f0f0f0_75%),linear-gradient(-45deg,transparent_75%,#f0f0f0_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px]"></div>
                          <img
                            src={processedImage}
                            alt="Processed"
                            className="relative w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Processing */}
                  {isProcessing && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Sparkles className="w-5 h-5 text-purple-600 animate-spin" />
                        <span className="text-gray-700">جاري معالجة الصورة بالذكاء الاصطناعي...</span>
                      </div>
                      <Progress value={progress} className="w-full" />
                      <p className="text-center text-sm text-gray-600">
                        {progress < 30 ? 'تحليل الصورة...' : 
                         progress < 70 ? 'تحديد الكائنات...' : 
                         progress < 90 ? 'إزالة الخلفية...' : 'اللمسات الأخيرة...'}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {!processedImage && !isProcessing && (
                      <Button 
                        onClick={processImage}
                        className="btn-primary text-white"
                        size="lg"
                        disabled={isProcessing}
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        إزالة الخلفية بالذكاء الاصطناعي
                      </Button>
                    )}
                    
                    {processedImage && (
                      <>
                        <Button 
                          onClick={downloadImage}
                          className="btn-secondary text-white"
                          size="lg"
                        >
                          <Download className="w-5 h-5 mr-2" />
                          تحميل الصورة
                        </Button>
                        <Button 
                          onClick={resetApp}
                          variant="outline"
                          size="lg"
                        >
                          <Upload className="w-5 h-5 mr-2" />
                          صورة جديدة
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Features Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              لماذا تختار أداتنا؟
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              نقدم أفضل تقنيات الذكاء الاصطناعي لإزالة الخلفيات بجودة احترافية
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="feature-card">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">سرعة فائقة</h4>
                <p className="text-gray-600">
                  معالجة الصور في أقل من 5 ثوانٍ بفضل تقنية الذكاء الاصطناعي المتطورة
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">جودة عالية</h4>
                <p className="text-gray-600">
                  دقة مثالية في تحديد الحواف والتفاصيل الدقيقة مع الحفاظ على جودة الصورة
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MousePointer className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">سهولة الاستخدام</h4>
                <p className="text-gray-600">
                  واجهة بسيطة وسهلة - ما عليك سوى رفع الصورة والحصول على النتيجة فوراً
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How it Works */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              كيف يعمل؟
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              ثلاث خطوات بسيطة للحصول على صورة بخلفية شفافة
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  1
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">ارفع الصورة</h4>
                <p className="text-gray-600">
                  اختر الصورة من جهازك أو اسحبها وأفلتها في المنطقة المخصصة
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  2
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">معالجة تلقائية</h4>
                <p className="text-gray-600">
                  يقوم الذكاء الاصطناعي بتحليل الصورة وإزالة الخلفية تلقائياً
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  3
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">حمل النتيجة</h4>
                <p className="text-gray-600">
                  احصل على صورتك بخلفية شفافة جاهزة للاستخدام بصيغة PNG
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              الأسئلة الشائعة
            </h3>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2">هل الخدمة مجانية؟</h4>
                <p className="text-gray-600">
                  نعم، يمكنك استخدام الأداة مجاناً لمعالجة الصور بجودة عالية.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2">ما هي الصيغ المدعومة؟</h4>
                <p className="text-gray-600">
                  ندعم جميع صيغ الصور الشائعة: JPG, PNG, JPEG, GIF, BMP, WEBP بحجم أقصى 10MB.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2">هل تحتفظون بالصور؟</h4>
                <p className="text-gray-600">
                  لا، جميع الصور تتم معالجتها على الخادم ولا نحتفظ بأي نسخ من صورك.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2">كم تستغرق عملية المعالجة؟</h4>
                <p className="text-gray-600">
                  عادة ما تستغرق العملية بين 3-10 ثوانٍ حسب حجم الصورة وتعقيدها.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">AI Background Remover</span>
          </div>
          <p className="text-gray-400 mb-4">
            أداة احترافية لإزالة الخلفيات بالذكاء الاصطناعي
          </p>
          <p className="text-sm text-gray-500">
            © 2025 AI Background Remover. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App

