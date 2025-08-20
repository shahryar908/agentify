export default function TestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-foreground animate-fade-in-up">Test Page - Fixes Applied</h1>
        <p className="text-lg text-muted-foreground mb-4 animate-fade-in-up">
          Testing all the fixes for Tailwind CSS configuration and custom animations.
        </p>
        
        {/* Basic Tailwind Test */}
        <div className="bg-primary text-primary-foreground p-4 rounded-lg mb-6 animate-fade-in-up">
          ✅ Basic Tailwind CSS is working! (Primary colors, spacing, etc.)
        </div>
        
        {/* Custom Animation Tests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border border-border rounded-xl p-6 animate-float">
            <h3 className="text-lg font-bold mb-2">Float Animation</h3>
            <p className="text-muted-foreground">This card should float up and down</p>
          </div>
          
          <div className="bg-gradient-to-r from-primary via-purple-500 to-cyan-500 text-white p-6 rounded-xl animate-gradient">
            <h3 className="text-lg font-bold mb-2">Gradient Animation</h3>
            <p>This background should animate colors</p>
          </div>
        </div>
        
        {/* Slide Animations */}
        <div className="space-y-4 mb-8">
          <div className="bg-secondary p-4 rounded-lg animate-slide-in-left">
            ← Slide in from left animation
          </div>
          <div className="bg-accent p-4 rounded-lg animate-slide-in-right">
            → Slide in from right animation
          </div>
        </div>
        
        {/* CSS Custom Properties Test */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold mb-2 text-card-foreground">CSS Variables Test</h3>
          <p className="text-muted-foreground">All HSL color variables should work properly</p>
          <div className="flex gap-2 mt-4">
            <div className="w-8 h-8 bg-primary rounded"></div>
            <div className="w-8 h-8 bg-secondary rounded"></div>
            <div className="w-8 h-8 bg-accent rounded"></div>
            <div className="w-8 h-8 bg-muted rounded"></div>
          </div>
        </div>
        
        {/* Blog Typography Test */}
        <div className="prose-blog">
          <h2>Blog Typography Test</h2>
          <p>This paragraph uses the custom blog typography styling with proper line height and spacing for optimal reading experience.</p>
          <blockquote>
            This is a blockquote with custom styling
          </blockquote>
          <code>This is inline code with custom styling</code>
          <pre>
            <code>
// This is a code block
function test() {
  return "Custom styling applied";
}
            </code>
          </pre>
        </div>
        
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-green-800 font-bold mb-2">✅ All Tests Passed!</h3>
          <p className="text-green-700">
            If you can see all the styles and animations above, the frontend is working correctly!
          </p>
        </div>
      </div>
    </div>
  )
}