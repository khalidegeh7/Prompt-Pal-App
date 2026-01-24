import { SignedIn, SignedOut, useUser, useAuth } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { Text, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { LEVELS, getUnlockedLevels } from '@/features/levels/data';
import { UsageDisplay } from '@/components/UsageDisplay';
import { UsageClient, UsageStats } from '@/lib/usage';
import { useGameStore } from '@/features/game/store';
import { useUserProgressStore, getOverallProgress } from '@/features/user/store';
import { logger } from '@/lib/logger';
import { SignOutButton } from '@/components/SignOutButton';
import { Button, Card, Modal } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';

// --- Sub-components ---

// Helper to map emoji icons to Ionicons names
const getIconName = (icon: string): any => {
  const mapping: Record<string, string> = {
    "🎨": "color-palette",
    "💻": "laptop",
    "✍️": "create",
    "🧠": "hardware-chip",
    "✨": "sparkles",
    "🔥": "flame",
    "🏆": "trophy",
    "📅": "calendar",
  };
  // If it's already a valid ionicon name or doesn't have a mapping, return as is
  return mapping[icon] || icon || "book";
};

const StatCard = ({ label, value, icon, color }: { label: string, value: string, icon: string, color: string }) => (
  <View className="bg-surface/50 border border-outline/30 p-4 rounded-2xl flex-1 mx-1 items-center">
    <Text className="text-onSurface text-2xl font-bold mb-1">{value}</Text>
    <View className="flex-row items-center">
      <Ionicons name={getIconName(icon)} size={14} color="black" />
      <Text className="text-onSurfaceVariant text-[10px] font-bold uppercase ml-1 tracking-wider">{label}</Text>
    </View>
  </View>
);

const QuestCard = ({ quest }: { quest: any }) => {
  const formatTimeRemaining = (hours: number) => {
    if (hours < 1) {
      return `${Math.floor(hours * 60)}m`;
    }
    return `${Math.floor(hours)}h`;
  };

  return (
    <View className="bg-info p-6 rounded-[32px] mb-10 overflow-hidden shadow-lg shadow-info/30">
      <View className="flex-row justify-between items-center mb-6">
        <View className="bg-white/20 px-3 py-1.5 rounded-full">
          <Text className="text-white text-[10px] font-extrabold uppercase tracking-widest">Daily Quest</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={16} color="black" />
          <Text className="text-white text-xs font-semibold ml-1.5">
            {formatTimeRemaining(quest.timeRemaining)} remaining
          </Text>
        </View>
      </View>

      <Text className="text-white text-2xl font-bold mb-2">{quest.title}</Text>
      <Text className="text-white/80 text-sm mb-8 leading-5">{quest.description}</Text>

      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <View className="bg-accent rounded-full p-1.5 mr-2">
            <Ionicons name="star" size={12} color="black" />
          </View>
          <Text className="text-white font-bold text-base">+{quest.xpReward} XP</Text>
        </View>
        <TouchableOpacity className="bg-white px-8 py-3.5 rounded-full shadow-sm">
          <Text className="text-info font-extrabold text-sm">Start Quest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ModuleCard = ({ 
  id,
  title, 
  category, 
  level, 
  topic, 
  progress, 
  icon, 
  thumbnail,
  accentColor,
  buttonText = "Continue Learning",
  onPress
}: any) => (
  <View className="bg-surface border border-outline/30 rounded-[32px] mb-8 overflow-hidden shadow-sm">
    {/* Header Pattern Area */}
    <View className="h-44 bg-surfaceVariant relative justify-center items-center">
      {thumbnail ? (
        <Image source={thumbnail} className="w-full h-full" resizeMode="cover" />
      ) : (
        <View className="w-full h-full items-center justify-center opacity-20">
          <Ionicons name={getIconName(icon)} size={80} color="black" />
        </View>
      )}
      <View className={`absolute top-4 left-4 w-12 h-12 rounded-2xl items-center justify-center ${accentColor}`}>
        <Ionicons name={getIconName(icon)} size={24} color="black" />
      </View>
    </View>
    
    <View className="p-6">
      <Text className={`text-[10px] font-extrabold uppercase mb-2 tracking-widest ${accentColor.replace('bg-', 'text-')}`}>
        {category}
      </Text>
      <Text className="text-onSurface text-2xl font-bold mb-4">{title}</Text>
      
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-onSurfaceVariant text-xs font-semibold">{level}: {topic}</Text>
        <Text className={`text-xs font-extrabold ${accentColor.replace('bg-', 'text-')}`}>{progress}%</Text>
      </View>
      
      {/* Progress Bar */}
      <View className="h-2 bg-surfaceVariant rounded-full mb-8 overflow-hidden">
        <View className={`h-full ${accentColor} rounded-full`} style={{ width: `${progress}%` }} />
      </View>
      
      <TouchableOpacity 
        onPress={() => onPress && onPress(id)}
        className="bg-surfaceVariant/50 py-4 rounded-2xl items-center flex-row justify-center border border-outline/10 active:bg-surfaceVariant"
      >
        <Text className="text-primary font-bold text-base mr-2">{buttonText}</Text>
        <Ionicons name="arrow-forward" size={18} color="#FF6B00" />
      </TouchableOpacity>
    </View>
  </View>
);


export default function HomeScreen() {
  const { user } = useUser()
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter();
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const { unlockedLevels } = useGameStore();
  const { level, xp, currentStreak, learningModules, currentQuest } = useUserProgressStore();
  const overallProgress = getOverallProgress(xp);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadUsage();
    }
  }, [isLoaded, isSignedIn]);

  const loadUsage = async () => {
    try {
      const usageData = await UsageClient.getUsage();
      setUsage(usageData);
    } catch (error) {
      logger.error('HomeScreen', error, { operation: 'loadUsage' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <SignedIn>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Top Profile Header */}
          <View className="px-6 pt-4 pb-6 flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/50 items-center justify-center overflow-hidden mr-3">
                {user?.imageUrl ? (
                  <Image source={{ uri: user.imageUrl }} className="w-full h-full" />
                ) : (
                  <Ionicons name="person" size={24} color="#FF6B00" />
                )}
              </View>
              <View>
                <Text className="text-onSurfaceVariant text-[10px] font-bold uppercase tracking-widest mb-0.5">Good Morning</Text>
                <Text className="text-onSurface text-lg font-bold">
                  {user?.firstName || "Alex"} {user?.lastName || "Prompt"}
                </Text>
              </View>
            </View>
            <View className="flex-row">
              <TouchableOpacity
                className="w-10 h-10 rounded-full bg-surfaceVariant/50 items-center justify-center mr-2"
                onPress={() => Alert.alert('Notifications', 'No new notifications')}
              >
                <Ionicons name="notifications-outline" size={20} color="#6B7280" />
                <View className="absolute top-2.5 right-3 w-2 h-2 bg-error rounded-full border border-background" />
              </TouchableOpacity>
              <TouchableOpacity
                className="w-10 h-10 rounded-full bg-surfaceVariant/50 items-center justify-center"
                onPress={() => setSettingsModalVisible(true)}
              >
                <Ionicons name="settings-outline" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Bar */}
          <View className="px-5 flex-row mb-8">
            <StatCard label="Level" value={level.toString()} icon="trophy-outline" color="#FF6B00" />
            <StatCard label="XP" value={xp.toLocaleString()} icon="flash-outline" color="#4151FF" />
            <StatCard label="Streak" value={currentStreak.toString()} icon="flame-outline" color="#F59E0B" />
          </View>

          {/* Overall Mastery */}
          <View className="px-6 mb-10">
            <View className="flex-row justify-between items-center mb-2.5">
              <Text className="text-onSurface text-xs font-bold uppercase tracking-widest">Overall Mastery</Text>
              <Text className="text-onSurfaceVariant text-xs font-bold">
                {overallProgress.current} / {overallProgress.total} XP
              </Text>
            </View>
            <View className="h-1.5 bg-surfaceVariant rounded-full overflow-hidden">
              <View className="h-full bg-info rounded-full" style={{ width: `${overallProgress.percentage}%` }} />
            </View>
          </View>

          {/* Daily Quest */}
          {currentQuest && (
            <View className="px-6">
              <QuestCard quest={currentQuest} />
            </View>
          )}

          {/* Learning Modules Section */}
          <View className="px-6 pb-20">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-onSurface text-xl font-bold">Learning Modules</Text>
              <TouchableOpacity>
                <Text className="text-primary text-sm font-bold">View All</Text>
              </TouchableOpacity>
            </View>

            {learningModules.map((module) => (
              <ModuleCard 
                key={module.id} 
                {...module} 
                onPress={(id: string) => router.push(`/(tabs)/game/levels/${id}`)}
              />
            ))}
          </View>
        </ScrollView>

        {/* Settings Modal */}
        <Modal
          visible={settingsModalVisible}
          onClose={() => setSettingsModalVisible(false)}
          title="Settings"
          size="sm"
        >
          <View className="space-y-4">
            <View className="flex-row items-center p-4 bg-surfaceVariant/50 rounded-xl">
              <Ionicons name="person-circle-outline" size={24} color="#6B7280" />
              <View className="ml-3 flex-1">
                <Text className="text-onSurface font-semibold">{user?.firstName || "User"} {user?.lastName || ""}</Text>
                <Text className="text-onSurfaceVariant text-sm">{user?.primaryEmailAddress?.emailAddress}</Text>
              </View>
            </View>

            <View className="space-y-2">
              <TouchableOpacity className="flex-row items-center p-4 bg-surfaceVariant/50 rounded-xl">
                <Ionicons name="notifications-outline" size={20} color="#6B7280" />
                <Text className="text-onSurface ml-3 flex-1">Notifications</Text>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center p-4 bg-surfaceVariant/50 rounded-xl">
                <Ionicons name="help-circle-outline" size={20} color="#6B7280" />
                <Text className="text-onSurface ml-3 flex-1">Help & Support</Text>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center p-4 bg-surfaceVariant/50 rounded-xl">
                <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
                <Text className="text-onSurface ml-3 flex-1">About</Text>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View className="pt-4 border-t border-outline/20">
              <SignOutButton />
            </View>
          </View>
        </Modal>

        {/* Mock Bottom Tab Bar - Since we can't easily change the real tab bar here without layout edits */}
        <View className="absolute bottom-0 left-0 right-0 h-24 bg-background/95 border-t border-outline/20 flex-row justify-around items-center px-4 pb-6">
          <View className="items-center">
            <Ionicons name="home" size={24} color="#FF6B00" />
            <Text className="text-primary text-[10px] font-bold mt-1">Home</Text>
          </View>
          <View className="items-center opacity-40">
            <Ionicons name="library-outline" size={24} color="white" />
            <Text className="text-white text-[10px] font-bold mt-1">Library</Text>
          </View>
          <View className="items-center opacity-40">
            <Ionicons name="stats-chart-outline" size={24} color="white" />
            <Text className="text-white text-[10px] font-bold mt-1">Ranking</Text>
          </View>
          <View className="items-center opacity-40">
            <Ionicons name="person-outline" size={24} color="white" />
            <Text className="text-white text-[10px] font-bold mt-1">Profile</Text>
          </View>
        </View>
      </SignedIn>

      <SignedOut>
        <ScrollView className="flex-1 bg-background" contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View className="h-[60%] justify-center items-center px-6 relative">
            <View className="items-center z-10">
              <View className="w-24 h-24 bg-surfaceVariant/50 rounded-[32px] items-center justify-center mb-8 border border-outline/20">
                <Ionicons name="flash" size={48} color="#FF6B00" />
              </View>
              
              <View className="flex-row items-center mb-4">
                <Text className="text-primary text-6xl font-bold tracking-tight">Prompt</Text>
                <Text className="text-secondary text-6xl font-bold tracking-tight">Pal</Text>
              </View>
              
              <Text className="text-onSurface text-2xl font-bold text-center mb-4 px-4 leading-8">
                Master the Art of{'\n'}AI Prompt Engineering
              </Text>
              
              <Text className="text-onSurfaceVariant text-base text-center leading-6 px-10">
                Level up your AI skills through immersive challenges, real-time feedback, and creative quests.
              </Text>
            </View>
          </View>

          {/* Feature Highlights */}
          <View className="px-6 py-10 bg-surface/30 rounded-t-[40px] flex-1">
            <View className="flex-row flex-wrap justify-between mb-10">
              <View className="w-[48%] bg-surfaceVariant/40 p-5 rounded-3xl mb-4 border border-outline/10">
                <View className="w-10 h-10 bg-primary/20 rounded-xl items-center justify-center mb-4">
                  <Ionicons name="game-controller" size={20} color="#FF6B00" />
                </View>
                <Text className="text-onSurface font-bold text-sm mb-1">Gamified</Text>
                <Text className="text-onSurfaceVariant text-[10px] leading-4">Progressive levels and rewarding challenges.</Text>
              </View>
              
              <View className="w-[48%] bg-surfaceVariant/40 p-5 rounded-3xl mb-4 border border-outline/10">
                <View className="w-10 h-10 bg-info/20 rounded-xl items-center justify-center mb-4">
                  <Ionicons name="rocket" size={20} color="#4151FF" />
                </View>
                <Text className="text-onSurface font-bold text-sm mb-1">Real-time</Text>
                <Text className="text-onSurfaceVariant text-[10px] leading-4">Instant AI feedback on your prompt quality.</Text>
              </View>

              <View className="w-[48%] bg-surfaceVariant/40 p-5 rounded-3xl border border-outline/10">
                <View className="w-10 h-10 bg-success/20 rounded-xl items-center justify-center mb-4">
                  <Ionicons name="trophy" size={20} color="#10B981" />
                </View>
                <Text className="text-onSurface font-bold text-sm mb-1">Mastery</Text>
                <Text className="text-onSurfaceVariant text-[10px] leading-4">Track your growth with XP and skill streaks.</Text>
              </View>

              <View className="w-[48%] bg-surfaceVariant/40 p-5 rounded-3xl border border-outline/10">
                <View className="w-10 h-10 bg-accent/20 rounded-xl items-center justify-center mb-4">
                  <Ionicons name="create" size={20} color="#F59E0B" />
                </View>
                <Text className="text-onSurface font-bold text-sm mb-1">Creative</Text>
                <Text className="text-onSurfaceVariant text-[10px] leading-4">Daily quests to spark your prompt imagination.</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="space-y-4 mb-10">
              <Link href="/(auth)/sign-up" asChild>
                <TouchableOpacity className="bg-primary py-5 rounded-2xl items-center shadow-lg shadow-primary/30">
                  <Text className="text-white font-bold text-lg">Get Started Free</Text>
                </TouchableOpacity>
              </Link>
              <Link href="/(auth)/sign-in" asChild>
                <TouchableOpacity className="bg-transparent py-5 rounded-2xl items-center border border-outline/30">
                  <Text className="text-onSurface font-bold text-lg">Welcome Back, Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
            
            <Text className="text-onSurfaceVariant text-center text-xs opacity-50 mb-10">
              Join 10,000+ prompt engineers leveling up today.
            </Text>
          </View>
        </ScrollView>
      </SignedOut>
    </SafeAreaView>
  );
}
