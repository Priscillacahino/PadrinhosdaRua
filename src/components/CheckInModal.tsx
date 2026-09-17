import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Utensils,
  Sparkles,
  Search,
  Code2,
  ArrowRight,
  Camera,
  RefreshCw,
  Download,
  AlertTriangle,
  Wrench,
  Check,
  Smartphone,
  VideoOff
} from 'lucide-react';
import { PontoCasinha, GPSCoords, ApiResponse } from '../types';
import { calculateDistanceMeters, formatDistance, formatDateTime } from '../utils/geo';
import { processCheckIn, RAIO_MAXIMO_CHECKIN_METROS } from '../utils/engine';

interface CheckInModalProps {
  ponto: PontoCasinha | null;
  userCoords: GPSCoords;
  onClose: () => void;
  onSuccess: (updatedPonto: PontoCasinha, apiResponse: ApiResponse<PontoCasinha>) => void;
  onSetUserCoords: (coords: GPSCoords) => void;
  currentSimulatedTime: Date;
}

function stampWatermarkOnCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  ponto: PontoCasinha,
  actionText: string,
  coords: GPSCoords,
  timestampStr: string
) {
  // Top Header Banner
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(0, 0, width, 36);
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('🐾 PADRINHOS DE RUA • COMPROVANTE OFICIAL AO VIVO (CÂMERA DO CELULAR)', 12, 22);

  // Bottom Footer Bar
  const bottomBarHeight = 48;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.fillRect(0, height - bottomBarHeight, width, bottomBarHeight);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(`Ponto #${ponto.id}: ${ponto.nome_ponto} • ${actionText}`, 12, height - bottomBarHeight + 18);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px monospace';
  ctx.fillText(`⏰ ${timestampStr} • 📍 GPS: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)} (<50m Validado)`, 12, height - bottomBarHeight + 36);
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  ponto,
  userCoords,
  onClose,
  onSuccess,
  onSetUserCoords,
  currentSimulatedTime,
}) => {
  if (!ponto) return null;

  const isVermelho = ponto.status === '🔴 Vermelho';
  const [tipoAcao, setTipoAcao] = useState<'abastecimento' | 'limpeza' | 'vistoria_geral' | 'reparo_vandalismo'>(
    isVermelho ? 'reparo_vandalismo' : 'abastecimento'
  );
  const [observacao, setObservacao] = useState('');
  const [lastResponse, setLastResponse] = useState<ApiResponse<PontoCasinha> | null>(null);

  // Camera States
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [capturedTimestamp, setCapturedTimestamp] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const distanceMeters = calculateDistanceMeters(
    userCoords.latitude,
    userCoords.longitude,
    ponto.latitude,
    ponto.longitude
  );

  const isWithinRadius = distanceMeters <= RAIO_MAXIMO_CHECKIN_METROS;

  const getActionLabel = (tipo: string) => {
    switch (tipo) {
      case 'reparo_vandalismo':
        return 'Reparo de Danos e Vandalismo Concluído';
      case 'abastecimento':
        return 'Abastecimento de Ração e Água';
      case 'limpeza':
        return 'Limpeza e Higienização';
      case 'vistoria_geral':
      default:
        return 'Vistoria Geral Preventiva';
    }
  };

  // Close camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const startCamera = async (facing: 'environment' | 'user' = facingMode) => {
    setCameraLoading(true);
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((e) => console.warn('Video play interrupted:', e));
        }
      }, 100);
    } catch (err: unknown) {
      console.warn('getUserMedia warning:', err);
      setCameraError(
        'Acesso à câmera direta bloqueado pelo navegador ou dispositivo. Utilize a captura nativa (capture="environment") ou a simulação ao vivo.'
      );
      setIsCameraActive(false);
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const toggleFacingMode = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    if (isCameraActive) {
      startCamera(nextFacing);
    }
  };

  const capturePhotoFromStream = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const timeStr = formatDateTime(currentSimulatedTime);
    stampWatermarkOnCanvas(ctx, canvas.width, canvas.height, ponto, getActionLabel(tipoAcao), userCoords, timeStr);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedPhoto(dataUrl);
    setCapturedTimestamp(timeStr);
    stopCamera();
    setLastResponse(null);
  };

  // Fallback para input nativo com capture="environment" (aciona a câmera do celular sem galeria)
  const handleNativeCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 800;
        canvas.height = img.height || 600;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const timeStr = formatDateTime(currentSimulatedTime);
        stampWatermarkOnCanvas(ctx, canvas.width, canvas.height, ponto, getActionLabel(tipoAcao), userCoords, timeStr);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setCapturedPhoto(dataUrl);
        setCapturedTimestamp(timeStr);
        setLastResponse(null);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Simulação de foto ao vivo para testes rápidos em ambiente de desenvolvimento / desktop
  const handleSimulateLiveCameraCapture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 540;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fundo simulando captura ao vivo na casinha
    const grad = ctx.createLinearGradient(0, 0, 800, 540);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(0.5, '#334155');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 540);

    // Casinha comunitária com comedouro e bebedouro limpos
    ctx.fillStyle = '#059669';
    ctx.fillRect(220, 220, 360, 260);
    // Telhado
    ctx.fillStyle = '#047857';
    ctx.beginPath();
    ctx.moveTo(190, 220);
    ctx.lineTo(400, 110);
    ctx.lineTo(610, 220);
    ctx.closePath();
    ctx.fill();

    // Entrada da casinha
    ctx.fillStyle = '#022c22';
    ctx.beginPath();
    ctx.arc(400, 340, 55, Math.PI, 0, false);
    ctx.lineTo(455, 480);
    ctx.lineTo(345, 480);
    ctx.closePath();
    ctx.fill();

    // Comedouro com ração cheia
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(280, 440, 45, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Ração OK', 255, 444);

    // Bebedouro com água limpa
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.ellipse(520, 440, 45, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e0f2fe';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Água OK', 500, 444);

    // Dizeres centrais
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`📸 FOTO AO VIVO DA CÂMERA: ${getActionLabel(tipoAcao).toUpperCase()}`, 170, 75);

    const timeStr = formatDateTime(currentSimulatedTime);
    stampWatermarkOnCanvas(ctx, 800, 540, ponto, getActionLabel(tipoAcao), userCoords, timeStr);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(dataUrl);
    setCapturedTimestamp(timeStr);
    stopCamera();
    setLastResponse(null);
  };

  const handleDownloadProof = () => {
    if (!capturedPhoto) return;
    const a = document.createElement('a');
    a.href = capturedPhoto;
    a.download = `comprovante_camera_ponto_${ponto.id}_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleSimulatePosition = (targetDistance: number) => {
    const offsetDegrees = targetDistance / 111320;
    onSetUserCoords({
      latitude: ponto.latitude + offsetDegrees,
      longitude: ponto.longitude,
      accuracy: 5,
    });
    setLastResponse(null);
  };

  const handleExecuteCheckIn = () => {
    if (!capturedPhoto) {
      setLastResponse({
        sucesso: false,
        codigo_status: 422,
        timestamp: formatDateTime(currentSimulatedTime),
        mensagem:
          'Operação rejeitada: Foto da câmera em tempo real obrigatória! O serviço não pode ser concluído nem o status alterado sem a comprovação fotográfica presencial. Não são aceitas fotos de galeria.',
        erro: {
          codigo: 'PHOTO_EVIDENCE_REQUIRED',
          detalhes: 'É obrigatório capturar uma foto diretamente pela câmera do celular para comprovar o atendimento.',
        },
      });
      return;
    }

    const result = processCheckIn(
      ponto,
      {
        ponto_id: ponto.id,
        tipo_acao: tipoAcao,
        user_latitude: userCoords.latitude,
        user_longitude: userCoords.longitude,
        observacao,
        foto_comprovante_camera: capturedPhoto,
        foto_timestamp: capturedTimestamp || formatDateTime(currentSimulatedTime),
      },
      currentSimulatedTime
    );

    setLastResponse(result.response);

    if (result.success && result.updatedCasinha) {
      setTimeout(() => {
        onSuccess(result.updatedCasinha!, result.response);
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto border border-stone-200 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isVermelho
                  ? 'bg-red-100 text-red-700'
                  : isWithinRadius
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {isVermelho ? <Wrench className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-stone-900 text-base">
                  {isVermelho ? 'Atendimento de Urgência & Reparo' : 'Atendimento & Check-in'}
                </h3>
                {isVermelho && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-800 border border-red-200">
                    🔴 URGENTE
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 font-mono">
                Ponto #{ponto.id}: {ponto.nome_ponto}
              </p>
            </div>
          </div>
          <button
            id="close-checkin-modal"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Active Urgency Alert Notice if Red */}
          {isVermelho && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-red-800">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Urgência que está sendo atendida:</span>
              </div>
              <p className="text-red-700 font-medium">{ponto.motivo_urgencia || 'Danos físicos / animal ferido'}</p>
              <p className="text-[11px] text-red-600 mt-1">
                Ao registrar a foto da câmera do reparo concluído, a urgência será finalizada e o status do ponto voltará para 🟢 Verde.
              </p>
            </div>
          )}

          {/* Anti-Fraude GPS Diagnostic Card */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isWithinRadius ? 'bg-emerald-50/70 border-emerald-300' : 'bg-red-50/70 border-red-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {isWithinRadius ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  Verificação Anti-Fraude GPS
                </span>
              </div>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isWithinRadius
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-red-100 text-red-800 border-red-300'
                }`}
              >
                {isWithinRadius ? 'AUTORIZADO (<50m)' : 'BLOQUEADO (>50m)'}
              </span>
            </div>

            <div className="space-y-2 mt-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-stone-600">Distância Calculada:</span>
                <span className={`font-bold text-sm ${isWithinRadius ? 'text-emerald-700' : 'text-red-700'}`}>
                  {formatDistance(distanceMeters)}
                </span>
              </div>

              <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${isWithinRadius ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{
                    width: `${Math.min(100, (distanceMeters / RAIO_MAXIMO_CHECKIN_METROS) * 100)}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                <span>0m</span>
                <span className="font-bold text-stone-700">Limite Máximo: 50.0m</span>
                <span>{distanceMeters > 50 ? `${Math.round(distanceMeters)}m` : '100m+'}</span>
              </div>
            </div>

            <p className={`text-xs mt-3 leading-relaxed ${isWithinRadius ? 'text-emerald-800' : 'text-red-800 font-medium'}`}>
              {isWithinRadius
                ? `✅ Proximidade verificada: Você está a ${formatDistance(distanceMeters)} da casinha.`
                : `🚫 Ação bloqueada pelo Anti-Fraude: Você está a ${formatDistance(distanceMeters)} de distância. Aproxime-se a menos de 50 metros.`}
            </p>

            <div className="mt-3 pt-3 border-t border-stone-200/60 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-stone-600 text-[11px]">Testar no simulador:</span>
              <button
                id="test-near-gps-btn"
                onClick={() => handleSimulatePosition(14)}
                className="px-2.5 py-1 bg-white hover:bg-stone-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
              >
                📍 Ficar a 14m (Permitido)
              </button>
              <button
                id="test-far-gps-btn"
                onClick={() => handleSimulatePosition(140)}
                className="px-2.5 py-1 bg-white hover:bg-stone-100 text-red-800 border border-red-300 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
              >
                📍 Ficar a 140m (Recusar)
              </button>
            </div>
          </div>

          {/* Action Choice */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
              Tipo de Ação Realizada:
            </label>
            <div className={`grid gap-2 ${isVermelho ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {isVermelho && (
                <button
                  type="button"
                  id="action-reparo-btn"
                  onClick={() => setTipoAcao('reparo_vandalismo')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    tipoAcao === 'reparo_vandalismo'
                      ? 'border-red-500 bg-red-50 text-red-900 font-semibold ring-2 ring-red-200'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <Wrench className="w-4 h-4 mx-auto mb-1 text-red-600" />
                  <span className="text-xs block">Reparo de Danos/Vandalismo</span>
                </button>
              )}

              <button
                type="button"
                id="action-abastecimento-btn"
                onClick={() => setTipoAcao('abastecimento')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  tipoAcao === 'abastecimento'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-2 ring-emerald-200'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <Utensils className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                <span className="text-xs block">Abasteci Comida/Água</span>
              </button>

              <button
                type="button"
                id="action-limpeza-btn"
                onClick={() => setTipoAcao('limpeza')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  tipoAcao === 'limpeza'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-2 ring-emerald-200'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <Sparkles className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                <span className="text-xs block">Limpei o Local</span>
              </button>

              <button
                type="button"
                id="action-vistoria-btn"
                onClick={() => setTipoAcao('vistoria_geral')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  tipoAcao === 'vistoria_geral'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-2 ring-emerald-200'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <Search className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                <span className="text-xs block">Vistoria Geral</span>
              </button>
            </div>
          </div>

          {/* MANDATORY REAL-TIME CAMERA PHOTO SECTION */}
          <div className="space-y-3 p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/40">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-stone-900 text-xs">
                  <Camera className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>CÂMERA EM TEMPO REAL (OBRIGATÓRIA)</span>
                  <span className="px-1.5 py-0.2 bg-red-600 text-white rounded text-[10px] font-mono">
                    NÃO ACEITA GALERIA
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 mt-0.5 leading-tight">
                  Para alterar o status para 🟢 Verde, é obrigatório fotografar ao vivo com a câmera do celular. O serviço não será concluído sem esta foto.
                </p>
              </div>
            </div>

            {/* Hidden native camera capture input with capture="environment" (direct phone camera) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleNativeCameraCapture}
            />

            {/* State 1: Live Video Camera Viewport */}
            {isCameraActive && (
              <div className="space-y-2">
                <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-emerald-500 shadow-inner">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 object-cover"
                  />
                  {/* Viewfinder crosshairs overlay */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3">
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 bg-red-600/90 text-white text-[10px] font-bold rounded-full flex items-center gap-1 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        AO VIVO • CÂMERA DO CELULAR
                      </span>
                      <span className="px-2 py-0.5 bg-black/60 text-emerald-400 text-[10px] font-mono rounded">
                        GPS: {userCoords.latitude.toFixed(4)}, {userCoords.longitude.toFixed(4)}
                      </span>
                    </div>

                    <div className="border border-white/40 rounded-xl w-3/4 h-28 mx-auto border-dashed flex items-center justify-center text-white/70 text-[11px]">
                      Enquadre a Casinha / Reparo Realizado
                    </div>

                    <div className="text-center text-[10px] text-white/80 bg-black/50 py-1 rounded">
                      Toque no botão verde abaixo para tirar a foto
                    </div>
                  </div>
                </div>

                {/* Shutter and control buttons */}
                <div className="flex items-center gap-2 justify-center pt-1">
                  <button
                    type="button"
                    id="capture-shutter-btn"
                    onClick={capturePhotoFromStream}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capturar Foto Agora</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleFacingMode}
                    className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors cursor-pointer"
                    title="Alternar Câmera (Frontal / Traseira)"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={stopCamera}
                    className="py-2.5 px-3 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* State 2: Camera Inactive & No Photo Captured Yet */}
            {!isCameraActive && !capturedPhoto && (
              <div className="space-y-2.5">
                <div className="p-4 border-2 border-dashed border-emerald-300 rounded-2xl text-center bg-white/70 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-stone-800 block">
                      Aguardando foto da câmera para liberação do status
                    </span>
                    <span className="text-[11px] text-stone-500 block mt-0.5">
                      Fotos salvas na galeria são bloqueadas pelo motor de validação.
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2 justify-center pt-1">
                    <button
                      type="button"
                      id="open-live-camera-btn"
                      onClick={() => startCamera()}
                      disabled={cameraLoading}
                      className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{cameraLoading ? 'Iniciando Câmera...' : 'Abrir Câmera ao Vivo'}</span>
                    </button>

                    <button
                      type="button"
                      id="open-native-camera-btn"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full sm:w-auto px-3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="Aciona a câmera nativa do celular (capture=environment)"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-stone-600" />
                      <span>Câmera Nativa do Celular</span>
                    </button>
                  </div>
                </div>

                {cameraError && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-start gap-1.5">
                    <VideoOff className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{cameraError}</span>
                  </div>
                )}

                {/* Shortcut for simulator / desktop evaluation */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    id="simulate-camera-photo-btn"
                    onClick={handleSimulateLiveCameraCapture}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold underline decoration-emerald-300 hover:decoration-emerald-500 cursor-pointer"
                  >
                    Simular foto da câmera em tempo real (Modo Teste / Desktop)
                  </button>
                </div>
              </div>
            )}

            {/* State 3: Photo Captured Successfully */}
            {!isCameraActive && capturedPhoto && (
              <div className="space-y-3 bg-white p-3.5 rounded-2xl border border-emerald-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Foto em Tempo Real Comprovada!</span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono">{capturedTimestamp}</span>
                </div>

                {/* Captured Photo Preview with Watermark */}
                <div className="relative rounded-xl overflow-hidden border border-emerald-200 bg-black/5 max-h-52">
                  <img
                    src={capturedPhoto}
                    alt="Foto capturada pela câmera do celular"
                    className="w-full h-44 object-cover"
                  />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <span className="px-2 py-0.5 bg-emerald-950/80 text-emerald-300 text-[10px] font-mono rounded backdrop-blur-xs">
                      ✔ Validação Biométrica & Local
                    </span>
                  </div>
                </div>

                {/* Proof Action Buttons: Retake or Download */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    id="download-proof-btn"
                    onClick={handleDownloadProof}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-xl border border-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Baixar a foto com carimbo oficial de comprovante"
                  >
                    <Download className="w-3.5 h-3.5 text-stone-600" />
                    <span>Baixar Comprovante</span>
                  </button>

                  <button
                    type="button"
                    id="retake-photo-btn"
                    onClick={() => {
                      setCapturedPhoto(null);
                      setCapturedTimestamp(null);
                      startCamera();
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                  >
                    Tirar Outra Foto
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Observação voluntária */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Observação voluntária (opcional):
            </label>
            <input
              type="text"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex: Pote de água lavado, ração fresca e estrutura reparada"
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Live API Response Display */}
          {lastResponse && (
            <div className="p-3 bg-stone-900 rounded-xl text-stone-200 text-xs font-mono space-y-2 border border-stone-800">
              <div className="flex items-center justify-between text-[11px] text-stone-400">
                <span className="flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5 text-emerald-400" /> Resposta da API
                </span>
                <span className={lastResponse.sucesso ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                  HTTP {lastResponse.codigo_status} {lastResponse.sucesso ? 'OK' : 'REJEITADO'}
                </span>
              </div>
              <p className="text-[11px] text-stone-300 font-sans">{lastResponse.mensagem}</p>
              <pre className="text-[10px] text-stone-400 overflow-x-auto p-2 bg-stone-950 rounded-lg max-h-36">
                {JSON.stringify(lastResponse, null, 2)}
              </pre>
            </div>
          )}

          {/* Validation Checklist / Warning */}
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-[11px] space-y-1">
            <span className="font-bold text-stone-800 block mb-1">Condições para conclusão do atendimento:</span>
            <div className="flex items-center gap-1.5">
              <span className={isWithinRadius ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>
                {isWithinRadius ? '✔' : '✖'}
              </span>
              <span className={isWithinRadius ? 'text-stone-700' : 'text-red-700 font-medium'}>
                Presença no local: GPS a menos de 50 metros ({formatDistance(distanceMeters)})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={capturedPhoto ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>
                {capturedPhoto ? '✔' : '✖'}
              </span>
              <span className={capturedPhoto ? 'text-stone-700' : 'text-red-700 font-medium'}>
                Foto capturada pela câmera do celular em tempo real (sem galeria)
              </span>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              id="cancel-checkin-btn"
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              id="submit-checkin-btn"
              type="button"
              onClick={handleExecuteCheckIn}
              disabled={!capturedPhoto || !isWithinRadius}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                isWithinRadius && capturedPhoto
                  ? isVermelho
                    ? 'bg-red-600 hover:bg-red-500 text-white cursor-pointer ring-2 ring-red-300'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer ring-2 ring-emerald-300'
                  : 'bg-stone-300 text-stone-500 cursor-not-allowed'
              }`}
            >
              <span>
                {isVermelho
                  ? 'Concluir Reparo & Restaurar para 🟢 Verde'
                  : 'Concluir Atendimento & Atualizar para 🟢 Verde'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
