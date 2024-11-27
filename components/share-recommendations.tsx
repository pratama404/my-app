'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface ShareRecommendationsProps {
  text: string
  mood?: string
  genre?: string
}

export function ShareRecommendations({ text, mood = 'neutral', genre = 'pop' }: ShareRecommendationsProps) {
  const [isSharing, setIsSharing] = useState(false)

  const getSpotifyLink = () => {
    const searchQuery = encodeURIComponent(`${mood} ${genre} playlist`)
    return `https://open.spotify.com/search/${searchQuery}`
  }

  const handleShare = async (platform: string) => {
    try {
      setIsSharing(true)
      const shareText = `${text}\n\nFeeling ${mood}? Listen to some ${genre} music: ${getSpotifyLink()}`
      
      switch (platform) {
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank')
          break
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`, '_blank')
          break
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(shareText)}`, '_blank')
          break
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')
          break
        case 'copy':
          await navigator.clipboard.writeText(shareText)
          toast.success('Copied to clipboard!')
          break
      }
    } catch (error) {
      toast.error('Failed to share')
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Spotify Recommendation */}
      <div className="mb-4">
        <a 
          href={getSpotifyLink()} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-[#1DB954] text-white rounded-full hover:bg-[#1ed760] transition-colors"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Listen on Spotify
        </a>
      </div>

      {/* Share Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleShare('twitter')}
          className="px-3 py-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Twitter
        </button>
        <button
          onClick={() => handleShare('facebook')}
          className="px-3 py-2 bg-[#4267B2] text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Facebook
        </button>
        <button
          onClick={() => handleShare('linkedin')}
          className="px-3 py-2 bg-[#0077B5] text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          LinkedIn
        </button>
        <button
          onClick={() => handleShare('whatsapp')}
          className="px-3 py-2 bg-[#25D366] text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          WhatsApp
        </button>
        <button
          onClick={() => handleShare('copy')}
          className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Copy Link
        </button>
      </div>
    </div>
  )
}
