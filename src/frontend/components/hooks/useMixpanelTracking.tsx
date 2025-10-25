import { useCallback } from 'react';
import { Principal } from '@dfinity/principal';

// Extend the Window interface to include mixpanel
declare global {
  interface Window {
    mixpanel?: {
      track: (eventName: string, properties?: Record<string, any>) => void;
      identify: (userId: string) => void;
      reset: () => void;
      people: {
        set: (properties: Record<string, any>) => void;
      };
    };
  }
}

interface UserProfileData {
  firstName?: string;
  lastName?: string;
  nickName?: string;
  specialty?: string;
  countryCode?: string;
  hasImage?: boolean;
}

interface IPData {
  tokenId: string;
  title?: string;
  type?: string;
  hasRoyalties?: boolean;
}

interface ListingData {
  tokenId: string;
  priceE6s: string;
}

interface PurchaseData {
  tokenId: string;
  priceE6s: string;
  hasRoyalties?: boolean;
}

interface ChatData {
  messageLength?: number;
  chatHistoryId?: string;
  isNewChat?: boolean;
}

export const useMixpanelTracking = () => {
  const track = useCallback((eventName: string, properties?: Record<string, any>) => {
    try {
      if (window.mixpanel) {
        window.mixpanel.track(eventName, properties);
      } else {
        console.warn('Mixpanel not initialized');
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, []);

  const identifyUser = useCallback((principal: Principal) => {
    try {
      if (window.mixpanel) {
        const userId = principal.toText();
        window.mixpanel.identify(userId);
      }
    } catch (error) {
      console.error('Error identifying user:', error);
    }
  }, []);

  const setUserProfile = useCallback((principal: Principal, data: UserProfileData) => {
    try {
      if (window.mixpanel) {
        const userId = principal.toText();
        window.mixpanel.identify(userId);
        window.mixpanel.people.set({
          $first_name: data.firstName,
          $last_name: data.lastName,
          nickname: data.nickName,
          specialty: data.specialty,
          country: data.countryCode,
          has_profile_image: data.hasImage || false,
        });
      }
    } catch (error) {
      console.error('Error setting user profile:', error);
    }
  }, []);

  // Specific tracking methods for better type safety and consistency

  const trackProfileCreated = useCallback((principal: Principal, data: UserProfileData) => {
    identifyUser(principal);
    setUserProfile(principal, data);
    track('Profile Created', {
      has_image: data.hasImage || false,
      has_specialty: !!data.specialty,
      country: data.countryCode,
    });
  }, [identifyUser, setUserProfile, track]);

  const trackProfileUpdated = useCallback((principal: Principal, data: UserProfileData) => {
    setUserProfile(principal, data);
    track('Profile Updated', {
      has_image: data.hasImage || false,
      has_specialty: !!data.specialty,
      country: data.countryCode,
    });
  }, [setUserProfile, track]);

  const trackIPCreated = useCallback((ipData: IPData) => {
    track('IP Created', {
      token_id: ipData.tokenId,
      title_length: ipData.title?.length || 0,
      ip_type: ipData.type,
      has_royalties: ipData.hasRoyalties || false,
    });
  }, [track]);

  const trackIPListed = useCallback((listingData: ListingData) => {
    track('IP Listed', {
      token_id: listingData.tokenId,
      price_e6s: listingData.priceE6s,
      price_usdt: Number(listingData.priceE6s) / 1_000_000,
    });
  }, [track]);

  const trackIPUnlisted = useCallback((tokenId: string) => {
    track('IP Unlisted', {
      token_id: tokenId,
    });
  }, [track]);

  const trackIPPurchased = useCallback((purchaseData: PurchaseData) => {
    track('IP Purchased', {
      token_id: purchaseData.tokenId,
      price_e6s: purchaseData.priceE6s,
      price_usdt: Number(purchaseData.priceE6s) / 1_000_000,
      has_royalties: purchaseData.hasRoyalties || false,
    });
  }, [track]);

  const trackChatMessageSent = useCallback((chatData: ChatData) => {
    track('Chat Message Sent', {
      message_length: chatData.messageLength,
      chat_history_id: chatData.chatHistoryId,
      is_new_chat: chatData.isNewChat || false,
    });
  }, [track]);

  const trackSubscriptionSet = useCallback((plan: string, priceE6s: string) => {
    track('Subscription Set', {
      plan,
      price_e6s: priceE6s,
      price_usdt: Number(priceE6s) / 1_000_000,
    });
  }, [track]);

  const trackPageView = useCallback((pageName: string, additionalData?: Record<string, any>) => {
    track('Page View', {
      page: pageName,
      ...additionalData,
    });
  }, [track]);

  return {
    track,
    identifyUser,
    setUserProfile,
    trackProfileCreated,
    trackProfileUpdated,
    trackIPCreated,
    trackIPListed,
    trackIPUnlisted,
    trackIPPurchased,
    trackChatMessageSent,
    trackSubscriptionSet,
    trackPageView,
  };
};
