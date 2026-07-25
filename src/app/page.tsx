'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import logoImg from '@/assets/Modern_bold_logo_nukerc_202607162056.jpeg'
import heroBgImg from '@/assets/New folder/Dark_tech_background_browser_das…_202607232204 (1).jpeg'
import { useAuthUser } from '@/hooks/useAuthUser'
import { useClock } from '@/hooks/useClock'
import { useWeather } from '@/hooks/useWeather'
import { useShortcuts } from '@/hooks/useShortcuts'
import { useChecklist } from '@/hooks/useChecklist'
import { useTileTilt } from '@/hooks/useTileTilt'
import { useManUtdMatch } from '@/hooks/useManUtdMatch'
import { AuthModal } from '@/components/dashboard/AuthModal'
import { LogoutConfirmModal } from '@/components/dashboard/LogoutConfirmModal'
import { ShortcutFormModal } from '@/components/dashboard/ShortcutFormModal'
import { DeleteShortcutModal } from '@/components/dashboard/DeleteShortcutModal'
import { Brand } from '@/components/dashboard/Brand'
import { HeaderPill } from '@/components/dashboard/HeaderPill'
import { MatchPill } from '@/components/dashboard/MatchPill'
import { LinkGrid } from '@/components/dashboard/LinkGrid'
import { ChecklistPanel } from '@/components/dashboard/ChecklistPanel'
import { NukeLoader } from '@/components/dashboard/NukeLoader'
import './Home.css'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const auth = useAuthUser()
  const clock = useClock()
  const weather = useWeather(auth.user)
  const shortcuts = useShortcuts(auth.user, auth.requireAuth)
  const checklist = useChecklist(auth.user, auth.requireAuth)
  const manUtd = useManUtdMatch()
  useTileTilt()

  // close modals on escape
  useEffect(() => {
    const anyModalOpen = shortcuts.addFormOpen || shortcuts.deleteConfirmId !== null || auth.authModalOpen || auth.logoutConfirmOpen
    if (!anyModalOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      shortcuts.handleCancelForm()
      shortcuts.cancelDeleteLink()
      auth.closeAuthModal()
      auth.cancelLogout()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [shortcuts.addFormOpen, shortcuts.deleteConfirmId, auth.authModalOpen, auth.logoutConfirmOpen])

  const deleteTarget = shortcuts.linksData?.find((l) => l._id === shortcuts.deleteConfirmId) ?? null

  return (
    <div className="home-root">
      {loading && <NukeLoader onDone={() => setLoading(false)} />}

      <AuthModal
        open={auth.authModalOpen}
        message={auth.authModalMessage}
        mode={auth.authMode}
        email={auth.authEmail}
        onEmailChange={auth.setAuthEmail}
        password={auth.authPassword}
        onPasswordChange={auth.setAuthPassword}
        error={auth.authError}
        info={auth.authInfo}
        loading={auth.authLoading}
        onSubmit={auth.handleAuthSubmit}
        onToggleMode={auth.toggleAuthMode}
        onClose={auth.closeAuthModal}
      />

      <LogoutConfirmModal open={auth.logoutConfirmOpen} onCancel={auth.cancelLogout} onConfirm={auth.confirmLogout} />

      <div className="hero" style={{ '--hero-bg-url': `url("${heroBgImg.src}")` } as CSSProperties}>
        <div className="bg-layer l-photo" />
        <div className="bg-layer l-gradient" />
        <div className="bg-layer l-grain" />
        <div className="bg-layer l-vignette" />

        <div className="hero-content">
          <div className="topbar">
            <Brand logoSrc={logoImg.src} />

            <MatchPill nextMatch={manUtd.nextMatch} lastMatch={manUtd.lastMatch} loading={manUtd.loading} />

            <HeaderPill
              time={clock.time}
              date={clock.date}
              weekday={clock.weekday}
              wCity={weather.wCity}
              onLocationClick={() => auth.requireAuth() && weather.setWeatherEditOpen(true)}
              weatherEditOpen={weather.weatherEditOpen}
              cityInput={weather.cityInput}
              onCityInputChange={weather.setCityInput}
              onCitySave={weather.handleCitySave}
              onWeatherEditCancel={() => weather.setWeatherEditOpen(false)}
              wIcon={weather.wIcon}
              tempC={weather.tempC}
              wDesc={weather.wDesc}
              onRefresh={weather.handleRefresh}
              user={auth.user}
              onLogout={auth.requestLogout}
              onLogin={auth.openAuthModal}
            />
          </div>

          <div className="content-row">
            <div className="content-left">
              <LinkGrid
                items={shortcuts.linksData || []}
                onEdit={shortcuts.handleEditLink}
                onDelete={shortcuts.requestDeleteLink}
                onAdd={shortcuts.openAddForm}
              />
            </div>

            <div className="content-right">
              <ChecklistPanel
                items={checklist.checklistData}
                doneCount={checklist.doneCount}
                checkInput={checklist.checkInput}
                onCheckInputChange={checklist.setCheckInput}
                onAdd={checklist.addCheckItem}
                onToggle={checklist.toggleCheckItem}
                onDelete={checklist.deleteCheckItem}
              />
            </div>
          </div>
        </div>
      </div>

      <ShortcutFormModal
        open={shortcuts.addFormOpen}
        isEditing={shortcuts.editId !== null}
        name={shortcuts.linkName}
        onNameChange={shortcuts.setLinkName}
        url={shortcuts.linkUrl}
        onUrlChange={shortcuts.setLinkUrl}
        icon={shortcuts.linkIcon}
        onIconChange={shortcuts.setLinkIcon}
        iconUploading={shortcuts.iconUploading}
        iconUploadError={shortcuts.iconUploadError}
        onIconFileChange={shortcuts.handleIconFileChange}
        onCancel={shortcuts.handleCancelForm}
        onSave={shortcuts.handleSaveLink}
      />

      <DeleteShortcutModal item={deleteTarget} onCancel={shortcuts.cancelDeleteLink} onConfirm={shortcuts.confirmDeleteLink} />

      <div className="footnote">made by nukerc</div>
    </div>
  )
}
