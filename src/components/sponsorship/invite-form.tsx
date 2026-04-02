"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function InviteForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const xHandle = (formData.get("x_handle") as string).replace("@", "").trim();

    if (!xHandle) {
      setError("Veuillez saisir un identifiant X.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Vous devez être connecté.");
      setLoading(false);
      return;
    }

    // Check if the handle is already an approved member (generic error for privacy)
    const { data: existingMember } = await supabase
      .from("profiles")
      .select("id")
      .eq("x_handle", xHandle)
      .eq("status", "approved")
      .maybeSingle();

    if (existingMember) {
      setError("Invitation impossible pour cet identifiant.");
      setLoading(false);
      return;
    }

    // Check if already invited by this user
    const { data: existingInvite } = await supabase
      .from("invitations")
      .select("id")
      .eq("inviter_id", user.id)
      .eq("invited_x_handle", xHandle)
      .maybeSingle();

    if (existingInvite) {
      setError("Vous avez déjà envoyé une invitation à @" + xHandle + ".");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("invitations")
      .insert({
        inviter_id: user.id,
        invited_x_handle: xHandle,
      });

    if (insertError) {
      setError("Erreur lors de l'envoi de l'invitation.");
      setLoading(false);
      return;
    }

    setSuccess("Invitation envoyée à @" + xHandle);
    (e.target as HTMLFormElement).reset();
    setLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-[12px]">
      <div className="flex gap-[8px]">
        <Input
          id="x_handle"
          name="x_handle"
          placeholder="@identifiant_x"
          className="flex-1"
        />
        <Button type="submit" disabled={loading} size="sm">
          <Send className="h-3.5 w-3.5" />
          {loading ? "Envoi…" : "Inviter"}
        </Button>
      </div>
      {error && (
        <p className="text-[12px] text-error">{error}</p>
      )}
      {success && (
        <p className="text-[12px] text-success">{success}</p>
      )}
    </form>
  );
}
