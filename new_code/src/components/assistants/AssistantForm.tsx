"use client"

import { useEffect, useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Bot, Play, Phone, ArrowRight, Plus, Pause, Search } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ElevenLabsClient } from "elevenlabs";
import TimezoneSelect from "react-timezone-select";
import { LANGUAGES } from "@/_utils/constants";

const formSchema = z.object({
  name: z.string().min(2, { message: "Assistant name is required" }),
  description: z.string().min(10, { message: "Description should be at least 10 characters" }),
  language: z.string({ required_error: "Please select a language" }),
  // speakingRate: z.string({ required_error: "Please select a speaking rate" }),
  // voicePitch: z.string({ required_error: "Please select a voice pitch" }),
  voice: z.string({ required_error: "Please select a voice" }),
  enableVoicemail: z.boolean().default(false),
  voiceRecording: z.boolean().default(false),
  timezone: z.any().optional(),
  detectCallerNumber: z.boolean().default(false),
  multi_lingual_enabled: z.boolean().default(false),
  // backgroundSound: z.boolean().default(false),
  // voiceSpeed: z.number().default(50),
  // backchanneling: z.boolean().default(false),
});

interface AssistantFormProps {
  initialValues: any;
  onFormDataChange: (data: any) => void;
}

export function AssistantForm({ initialValues, onFormDataChange }: AssistantFormProps) {
  const [voices, setVoices] = useState<any[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectOpen, setSelectOpen] = useState(false);
  console.log("initialValues>>", initialValues);
  

  const client = new ElevenLabsClient({ apiKey: process.env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY });

  console.log("initialValues>>", initialValues);

  const fetchVoices = async () => {
    try {
      setIsLoadingVoices(true);
      const response = await client.voices.getAll({
        show_legacy: true,
      });
      if (response && response.voices) {
        setVoices(response.voices);
        console.log("Fetched voices:", response.voices);
      } else {
        console.log("Invalid response format:", response);
        // Fallback to default voice if API fails
        setVoices([{
          voice_id: "xrNwYO0xeioXswMCcFNF",
          name: "Ingmar - Intimately Mysterious",
          preview_url: "https://storage.googleapis.com/eleven-public-prod/database/user/iqZvP9uOFYfUw0BsDUQRmHyEHA02/voices/xrNwYO0xeioXswMCcFNF/FLZMQcL3u2BDyQksaRcN.mp3",
          labels: {
            accent: "american",
            descriptive: "whispery",
            gender: "male"
          },
          description: "Middle-aged male voice that captivates with its soft, husky tone."
        }]);
      }
    } catch (error) {
      console.log("Error fetching voices:", error);
      // Fallback to default voice if API fails
      setVoices([{
        voice_id: "xrNwYO0xeioXswMCcFNF",
        name: "Ingmar - Intimately Mysterious",
        preview_url: "https://storage.googleapis.com/eleven-public-prod/database/user/iqZvP9uOFYfUw0BsDUQRmHyEHA02/voices/xrNwYO0xeioXswMCcFNF/FLZMQcL3u2BDyQksaRcN.mp3",
        labels: {
          accent: "american",
          descriptive: "whispery",
          gender: "male"
        },
        description: "Middle-aged male voice that captivates with its soft, husky tone."
      }]);
    } finally {
      setIsLoadingVoices(false);
    }
  }

  useEffect(() => {
    fetchVoices();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      language: initialValues?.language || "",
      // speakingRate: initialValues?.speakingRate || "",
      // voicePitch: initialValues?.voicePitch || "",
      voice: initialValues?.voice || "",
      enableVoicemail: initialValues?.voicemailEnabled || false,
      voiceRecording: initialValues?.voiceRecording || false,
      timezone: initialValues?.timezone=="UTC"? "America/Detroit": initialValues?.timezone,
      detectCallerNumber: initialValues?.detectCallerNumber || false,
      multi_lingual_enabled: initialValues?.multi_lingual_enabled || false,
      // backgroundSound: initialValues?.backgroundSound || false,
      // voiceSpeed: initialValues?.voiceSpeed || 50,
      // backchanneling: initialValues?.backchanneling || false,
    },
  });

  // Update form values when initialValues changes
  useEffect(() => {
    if (initialValues) {
      form.reset({
        name: initialValues.name || "",
        description: initialValues.description || "",
        language: initialValues.language || "",
        // speakingRate: initialValues.speakingRate || "",
        // voicePitch: initialValues.voicePitch || "",
        voice: initialValues.voice || "",
        enableVoicemail: initialValues.voicemailEnabled || false,
        voiceRecording: initialValues.voiceRecording || false,
        timezone: initialValues?.timezone=="UTC"? "America/Detroit": initialValues?.timezone,
        detectCallerNumber: initialValues?.detectCallerNumber || false,
        multi_lingual_enabled: initialValues?.multi_lingual_enabled || false,
        // backgroundSound: initialValues.backgroundSound || false,
        // voiceSpeed: initialValues.voiceSpeed || 50,
        // backchanneling: initialValues.backchanneling || false,
      });
    }
  }, [initialValues, form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      onFormDataChange(value);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, onFormDataChange]);

  const playVoiceSample = (voiceId: string, previewUrl: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (playingVoice === voiceId) {
      setPlayingVoice(null);
      return;
    }

    audioRef.current = new Audio(previewUrl);
    audioRef.current.play();
    audioRef.current.onended = () => {
      setPlayingVoice(null);
    };
    setPlayingVoice(voiceId);
  };

  const filteredVoices = voices && Array.isArray(voices)
    ? voices.filter((voice: any) =>
      voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (voice.labels?.descriptive && voice.labels.descriptive.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (voice.labels?.gender && voice.labels.gender.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (voice.labels?.accent && voice.labels.accent.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    : [];

  // Handle search input change without losing focus
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    e.stopPropagation();
  };

  // Focus search input when select opens
  useEffect(() => {
    if (selectOpen && searchInputRef.current) {
      // Short delay to ensure the select content is fully rendered
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectOpen]);

  return (
    <div className="px-8 py-6 flex-1">
      <Card className="w-full">
        <Form {...form}>
          <form>
            <CardHeader className="border-b">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <Avatar className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl border-2 border-indigo-300 shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-700">
                      <Bot className="h-12 w-12 text-white drop-shadow-md" />
                    </AvatarFallback>
                  </Avatar>
                  {/* <Button
                    size="icon"
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-indigo-600 shadow-md hover:bg-indigo-700 border-2 border-white transition-colors duration-200"
                  >
                    <span className="sr-only">Upload avatar</span>
                    <Plus className="h-4 w-4 text-white" />
                  </Button> */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 bg-black/10 transition-opacity duration-200"></div>
                </div>
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormControl>
                          <Input
                            placeholder="Assistant Name"
                            style={{ fontSize: "1.8rem", paddingLeft: "0rem" }}
                            className="text-4xl font-bold border-0 focus-visible:ring-0 focus-visible:ring-offset-0 py-4 h-auto shadow-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">
                          Give your assistant a unique name
                        </FormDescription>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8 space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Basic Configuration</h3>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agent Role / Nickname</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Describe your agent's role or how you'd refer to them (optional)."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="detectCallerNumber"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Detect Caller Number
                        </FormLabel>
                        <FormDescription className="text-sm text-gray-500">
                          Enable detection and identification of caller phone numbers
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone</FormLabel>
                      <FormControl>
                        <TimezoneSelect
                          value={field.value}
                          onChange={(value) => field.onChange(value.value)}
                          className="react-select"
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-gray-500">
                        Select the timezone for your assistant
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Voice Configuration</h3>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={initialValues?.language || "EN"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LANGUAGES?.map((language: any) => (
                              <SelectItem key={language.value} value={language.value}>
                                {language.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {/* <FormDescription className="text-sm text-gray-500">
                          Currently only English is supported
                        </FormDescription> */}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="voice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">Voice Selection</FormLabel>
                        <div className="relative">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
                            <FormControl>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                onOpenChange={setSelectOpen}
                                open={selectOpen}
                              >
                                <SelectTrigger className="w-full h-22 sm:w-[800px] bg-white border border-gray-200 hover:border-primary focus:ring-2 focus:ring-primary/40 transition rounded-lg shadow-sm">
                                  <SelectValue placeholder="Choose a voice for your assistant" />
                                </SelectTrigger>
                                <SelectContent className="bg-white rounded-lg shadow-xl border border-gray-200 w-[800px] max-h-[500px] overflow-hidden">
                                  <div className="p-2 border-b border-gray-100">
                                    <div className="relative">
                                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                      <Input
                                        placeholder="Search voices by name, accent, gender..."
                                        className="pl-8 pr-2 text-sm border-gray-200 focus:ring-2 focus:ring-primary focus:outline-none rounded-md"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        ref={searchInputRef}
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => e.stopPropagation()}
                                      />
                                    </div>
                                  </div>
                                  <div className="max-h-[350px] w-[800px] overflow-y-auto px-2 py-1 space-y-1">
                                    {isLoadingVoices ? (
                                      <div className="text-center py-4 text-sm text-gray-500">Loading voices...</div>
                                    ) : filteredVoices.length > 0 ? (
                                      filteredVoices.map((voice: any) => (
                                        <SelectItem
                                          key={voice.voice_id}
                                          value={voice.voice_id}
                                          className="hover:bg-primary/5 rounded-md transition px-2 py-1.5 data-[state=checked]:bg-primary/10 data-[state=checked]:font-medium"
                                        >
                                          <div className="block">
                                            <p className="text-sm font-medium text-gray-800 data-[state=checked]:text-primary text-start">{voice.name}</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {voice.labels?.gender && (
                                                <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                                                  {voice.labels.gender.charAt(0).toUpperCase() + voice.labels.gender.slice(1)}
                                                </Badge>
                                              )}
                                              {voice.labels?.accent && (
                                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                                                  {voice.labels.accent.charAt(0).toUpperCase() + voice.labels.accent.slice(1)}
                                                </Badge>
                                              )}
                                              {voice.labels?.descriptive && (
                                                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200">
                                                  {voice.labels.descriptive.charAt(0).toUpperCase() + voice.labels.descriptive.slice(1)}
                                                </Badge>
                                              )}
                                            </div>
                                            {voice.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2 data-[state=checked]:text-primary/70">{voice.description}</p>}
                                          </div>
                                        </SelectItem>
                                      ))
                                    ) : (
                                      <div className="text-center py-4 text-sm text-gray-500">No voices match your search</div>
                                    )}
                                  </div>
                                </SelectContent>
                              </Select>
                            </FormControl>

                            {field.value && (
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="h-10 w-10 rounded-lg bg-primary/10 hover:bg-primary/20 border-0 shadow-sm transition"
                                onClick={() => {
                                  const selectedVoice = voices.find((v: any) => v.voice_id === field.value);
                                  if (selectedVoice?.preview_url) {
                                    playVoiceSample(selectedVoice.voice_id, selectedVoice.preview_url);
                                  }
                                }}
                              >
                                {playingVoice === field.value ? (
                                  <Pause className="h-4 w-4 text-primary" />
                                ) : (
                                  <Play className="h-4 w-4 text-primary" />
                                )}
                                <span className="sr-only">
                                  {playingVoice === field.value ? "Pause" : "Play"} selected voice
                                </span>
                              </Button>
                            )}
                          </div>
                        </div>
                        {/* <FormDescription className="text-xs mt-2 text-gray-500 italic">
                          Choose from premium ElevenLabs voices for your assistant. Preview each voice before making your selection.
                        </FormDescription> */}
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="multi_lingual_enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 bg-muted rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="m9 12 2 2 4-4"/>
                            <path d="M21 12c0 1.2-.6 2.3-1.5 3"/>
                            <path d="M3 12c0-1.2.6-2.3 1.5-3"/>
                            <path d="M12 3c1.2 0 2.3.6 3 1.5"/>
                            <path d="M12 21c-1.2 0-2.3-.6-3-1.5"/>
                          </svg>
                        </div>
                        <div>
                          <FormLabel className="text-sm font-medium">Multi-lingual Support</FormLabel>
                          <FormDescription className="text-xs">
                            Enable automatic language detection and multi-language conversation support
                          </FormDescription>
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Additional Settings</h3>
                  <Badge variant="outline">Optional</Badge>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="voiceRecording"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between p-4 bg-muted rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-disc">
                              <circle cx="12" cy="12" r="10" />
                              <circle cx="12" cy="12" r="2" />
                            </svg>
                          </div>
                          <div>
                            <FormLabel className="text-sm font-medium">Voice Recording</FormLabel>
                            <FormDescription className="text-xs">
                              Record and save voice interactions
                            </FormDescription>
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>       
          </form>
        </Form>
      </Card>
    </div>
  );
}