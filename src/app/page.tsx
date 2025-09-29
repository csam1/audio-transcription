"use client";

import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "../hooks/use-toast";
import { improveTranscription } from "@/ai/flows/improve-transcription";
import { summarizeAudioNote } from "@/ai/flows/summarise-audio-notes";
import { suggestTags } from "@/ai/flows/suggest-tags";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [transcription, setTranscription] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  function blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = async (event) => {
        const audioBlob = new Blob([event.data], { type: "audio/wav" });
        const url = await blobToDataURL(audioBlob);
        setAudioURL(url);
      };

      recorder.onstop = () => {
        setIsRecording(false);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      toast({
        title: "Recording started!",
        description: "Your audio is being recorded.",
      });
    } catch (error: any) {
      console.error("Error starting recording:", error);
      toast({
        title: "Error starting recording",
        description: error.message,
        variant: "destructive",
      });
    }
  }, []);

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      toast({
        title: "Recording stopped!",
        description: "Your audio recording has been saved.",
      });
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const processAudio = async () => {
    if (!audioURL) {
      toast({
        title: "No audio recorded",
        description: "Please record audio before processing.",
        variant: "destructive",
      });
      return;
    }

    // Mock Transcription
    const mockInitialTranscription =
      "This is a mock transcription. Please replace with actual transcription.";
    setTranscription(mockInitialTranscription);

    try {
      const improved = await improveTranscription({
        audioUrl: audioURL,
        initialTranscription: mockInitialTranscription,
      });
      setTranscription(improved.improvedTranscription);
      toast({
        title: "Transcription Improved",
        description: "Transcription has been refined for better accuracy.",
      });

      // Generate Summary
      const summarized = await summarizeAudioNote({
        transcript: improved.improvedTranscription,
      });
      setSummary(summarized.summary);

      // Suggest Tags
      const suggestedTags = await suggestTags({
        transcription: improved.improvedTranscription,
      });
      setTags(suggestedTags.tags);

      toast({
        title: "AI Processing Complete",
        description: "Summary and tags generated.",
      });
    } catch (error: any) {
      console.error("Error processing audio:", error);
      toast({
        title: "Error processing audio",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-primary">
        AudioNotes
      </h1>
      <Card className="w-full max-w-3xl mb-4">
        <CardContent className="flex flex-col items-center p-4">
          <div className="flex justify-center space-x-4 mb-4">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant="outline"
              className={
                isRecording
                  ? "bg-accent text-accent-foreground hover:bg-accent/80"
                  : ""
              }
              disabled={!!audioURL}
            >
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Button>
            {audioURL && (
              <>
                <Button onClick={playAudio} variant="outline">
                  Play
                </Button>
                <Button onClick={pauseAudio} variant="outline">
                  Pause
                </Button>
              </>
            )}
          </div>
          {audioURL && (
            <audio
              ref={audioRef}
              src={audioURL}
              controls
              className="w-full"
            ></audio>
          )}
        </CardContent>
      </Card>

      <Card className="w-full max-w-3xl mb-4">
        <CardContent className="p-4">
          <Textarea
            placeholder="Transcription will appear here..."
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            className="mb-4"
          />
          <Button onClick={processAudio} disabled={!audioURL}>
            Process Audio (AI)
          </Button>
        </CardContent>
      </Card>

      {summary && (
        <Card className="w-full max-w-3xl mb-4">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">Summary</h3>
            <p>{summary}</p>
          </CardContent>
        </Card>
      )}

      {tags.length > 0 && (
        <Card className="w-full max-w-3xl">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
