"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { FiCamera, FiTrash2 } from "react-icons/fi";
import { AvatarCropper } from "@/components/admin/avatar-cropper";
import { uploadImage } from "@/components/admin/upload";
import type { AdminProfile } from "@/lib/admin-account";
import { changeCredentials, saveProfile, saveProfilePhoto } from "../manage-actions";

const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25";
const labelClass = "mb-1.5 block text-xs font-semibold text-muted";

type Status = { ok: boolean; text: string } | null;

export function ProfileForm({ profile, email, ready }: { profile: AdminProfile; email: string; ready: boolean }) {
  const router = useRouter();
  const [name, setName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio);
  const [photo, setPhoto] = useState(profile.photoUrl);
  const [crop, setCrop] = useState<File | null>(null);
  const [profileStatus, setProfileStatus] = useState<Status>(null);
  const [photoStatus, setPhotoStatus] = useState<Status>(null);
  const [accountStatus, setAccountStatus] = useState<Status>(null);
  const [account, setAccount] = useState({ currentPassword: "", newEmail: "", newPassword: "" });
  const [pending, startTransition] = useTransition();
  const input = useRef<HTMLInputElement>(null);

  function onPick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file && file.type.startsWith("image/")) setCrop(file);
    else if (file) setPhotoStatus({ ok: false, text: "Yalnızca görsel dosyası seçin." });
  }

  function uploadCropped(file: File) {
    setCrop(null);
    startTransition(async () => {
      try {
        const uploaded = await uploadImage(file, "rovax/profile");
        const result = await saveProfilePhoto(uploaded.url, uploaded.publicId);
        if (!result.ok) throw new Error(result.error);
        setPhoto(uploaded.url);
        setPhotoStatus({ ok: true, text: "Profil fotoğrafı güncellendi." });
        router.refresh();
      } catch (error) {
        setPhotoStatus({ ok: false, text: error instanceof Error ? error.message : "Yüklenemedi." });
      }
    });
  }

  function removePhoto() {
    if (!window.confirm("Profil fotoğrafı silinsin mi?")) return;
    startTransition(async () => {
      const result = await saveProfilePhoto("", "");
      if (result.ok) {
        setPhoto("");
        setPhotoStatus({ ok: true, text: "Profil fotoğrafı silindi." });
        router.refresh();
      } else setPhotoStatus({ ok: false, text: result.error ?? "Silinemedi." });
    });
  }

  function saveInfo() {
    startTransition(async () => {
      const result = await saveProfile({ displayName: name, bio });
      setProfileStatus(result.ok ? { ok: true, text: "Profil bilgileri kaydedildi." } : { ok: false, text: result.error ?? "Kaydedilemedi." });
      if (result.ok) router.refresh();
    });
  }

  function saveAccount() {
    startTransition(async () => {
      const result = await changeCredentials(account);
      if (result.ok) {
        router.push("/admin/login");
        router.refresh();
      } else setAccountStatus({ ok: false, text: result.error ?? "Güncellenemedi." });
    });
  }

  const initials = (name || email).slice(0, 2).toLocaleUpperCase("tr");

  return (
    <div className="max-w-3xl space-y-8">
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="font-semibold">Profil fotoğrafı</h2>
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <div className="relative h-28 w-28 overflow-hidden rounded-full bg-gradient-to-br from-accent to-accent-2 ring-4 ring-accent/20">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="Profil fotoğrafı" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-accent-foreground">{initials}</span>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={!ready || pending} onClick={() => input.current?.click()} className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium hover:border-accent hover:text-accent disabled:opacity-50">
                <FiCamera className="h-4 w-4" /> {photo ? "Fotoğrafı değiştir" : "Fotoğraf yükle"}
              </button>
              {photo && (
                <button type="button" disabled={pending} onClick={removePhoto} className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm text-red-500 hover:underline disabled:opacity-50">
                  <FiTrash2 className="h-4 w-4" /> Sil
                </button>
              )}
            </div>
            <p className="text-xs text-muted">Fotoğraf Hakkımızda alanına uygun 4:5 portre oranında kırpılır. Sürükleyip yakınlaştırarak kadrajı ayarlayın.</p>
            {!ready && <p className="text-xs text-amber-500">Görsel yükleme için R2 depolama bilgileri tanımlı olmalı.</p>}
          </div>
          <input ref={input} type="file" accept="image/*" onChange={onPick} className="sr-only" />
        </div>
        {photoStatus && <p role={photoStatus.ok ? "status" : "alert"} className={`mt-3 text-sm ${photoStatus.ok ? "text-emerald-500" : "text-red-500"}`}>{photoStatus.text}</p>}
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="font-semibold">Profil bilgileri</h2>
        <div>
          <label htmlFor="name" className={labelClass}>Görünen ad</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={inputClass} placeholder="Ad Soyad" />
        </div>
        <div>
          <label htmlFor="bio" className={labelClass}>Kısa not</label>
          <textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} className={inputClass} />
        </div>
        {profileStatus && <p role={profileStatus.ok ? "status" : "alert"} className={`text-sm ${profileStatus.ok ? "text-emerald-500" : "text-red-500"}`}>{profileStatus.text}</p>}
        <button type="button" onClick={saveInfo} disabled={pending} className="button-primary inline-flex h-10 items-center rounded-xl px-6 text-sm font-semibold disabled:opacity-60">Kaydet</button>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="font-semibold">Giriş bilgileri</h2>
        <p className="text-xs text-muted">Mevcut e-posta: <span className="font-medium text-foreground">{email}</span>. Değişiklikten sonra yeniden giriş yapmanız gerekir.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="newEmail" className={labelClass}>Yeni e-posta (isteğe bağlı)</label>
            <input id="newEmail" type="email" autoComplete="off" value={account.newEmail} onChange={(e) => setAccount((c) => ({ ...c, newEmail: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label htmlFor="newPassword" className={labelClass}>Yeni şifre (en az 10 karakter)</label>
            <input id="newPassword" type="password" autoComplete="new-password" value={account.newPassword} onChange={(e) => setAccount((c) => ({ ...c, newPassword: e.target.value }))} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="currentPassword" className={labelClass}>Mevcut şifre *</label>
            <input id="currentPassword" type="password" autoComplete="current-password" value={account.currentPassword} onChange={(e) => setAccount((c) => ({ ...c, currentPassword: e.target.value }))} className={inputClass} />
          </div>
        </div>
        {accountStatus && <p role="alert" className="text-sm text-red-500">{accountStatus.text}</p>}
        <button type="button" onClick={saveAccount} disabled={pending || !account.currentPassword} className="inline-flex h-10 items-center rounded-xl border border-border px-6 text-sm font-semibold hover:border-accent disabled:opacity-50">Bilgileri güncelle</button>
      </section>

      {crop && <AvatarCropper file={crop} onCancel={() => setCrop(null)} onDone={uploadCropped} />}
    </div>
  );
}
