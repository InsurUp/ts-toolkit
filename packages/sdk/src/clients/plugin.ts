import type { HttpTransport } from '../client/http.js';
import type { InsurUpResult } from '../core/result.js';
import type { RequestOptions } from '../core/options.js';
import { plugins } from '../core/endpoints.js';
import type {
  ActivatePluginRequest,
  GetPluginLogsOptions,
  PluginDetail,
  PluginInvocationLog,
  PluginSummary,
  SetPluginPriorityRequest,
  UpdatePluginConfigRequest,
} from '@insurup/contracts';

/**
 * Provides server-side plugin management operations: installing/upgrading plugin bundles, selecting
 * the active version, toggling enablement, configuring per-agent settings, and inspecting invocation
 * logs within the InsurUp platform.
 *
 * Sunucu tarafı eklenti yönetimi işlemlerini sağlar: eklenti paketlerini kurma/yükseltme, etkin sürümü
 * seçme, etkinleştirmeyi değiştirme, acente bazlı ayarları yapılandırma ve çalıştırma günlüklerini inceleme.
 */
export class InsurUpPluginClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Lists the installed plugins for the current agent (one row per slug).
   *
   * Mevcut acente için yüklü eklentileri listeler (slug başına bir satır).
   *
   * @returns The installed plugins / Yüklü eklentiler
   */
  async getPlugins(options?: RequestOptions): Promise<InsurUpResult<PluginSummary[]>> {
    return this.http.get<PluginSummary[]>(plugins.getAll, options);
  }

  /**
   * Retrieves a plugin's full detail, including its version history and masked config.
   *
   * Bir eklentinin sürüm geçmişi ve maskelenmiş yapılandırması dahil tam detayını getirir.
   *
   * @param pluginId Unique identifier of the plugin / Eklentinin benzersiz tanımlayıcısı
   * @returns Plugin detail / Eklenti detayı
   */
  async getPluginById(
    pluginId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<PluginDetail>> {
    return this.http.get<PluginDetail>(plugins.getById.render(pluginId), options);
  }

  /**
   * Uploads a plugin bundle (a `.zip` containing `plugin.json` + the entry module), creating the
   * plugin or installing a new version. Hooks and the config schema are derived from the bundle by
   * the host; a bundle that uses Node.js/browser APIs is rejected.
   *
   * Bir eklenti paketi (`plugin.json` + giriş modülü içeren bir `.zip`) yükler; eklentiyi oluşturur veya
   * yeni bir sürüm kurar. Kancalar ve yapılandırma şeması paketten türetilir.
   *
   * @param bundle The bundle as a Blob/File or ArrayBuffer (e.g. `Bun.file(path)` or `await res.arrayBuffer()`) / Blob/File veya ArrayBuffer olarak paket
   * @param fileName The bundle file name, e.g. `my-plugin.zip` / Paket dosya adı
   * @returns The created or updated plugin detail / Oluşturulan veya güncellenen eklenti detayı
   */
  async uploadPlugin(
    bundle: Blob | ArrayBuffer,
    fileName: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<PluginDetail>> {
    const blob = bundle instanceof Blob ? bundle : new Blob([bundle], { type: 'application/zip' });
    const form = new FormData();
    form.append('file', blob, fileName);
    return this.http.post<PluginDetail>(plugins.upload, form, options);
  }

  /**
   * Activates an installed version, making it the version the host runs. Activating also enables the
   * plugin.
   *
   * Yüklü bir sürümü etkinleştirir; ana bilgisayarın çalıştırdığı sürüm yapar (eklentiyi de etkinleştirir).
   *
   * @param pluginId Unique identifier of the plugin / Eklentinin benzersiz tanımlayıcısı
   * @param request The version to activate / Etkinleştirilecek sürüm
   * @returns Operation result / İşlem sonucu
   */
  async activatePlugin(
    pluginId: string,
    request: ActivatePluginRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(plugins.activate.render(pluginId), request, options);
  }

  /**
   * Enables the plugin so its hooks are dispatched.
   *
   * Kancalarının gönderilmesi için eklentiyi etkinleştirir.
   *
   * @param pluginId Unique identifier of the plugin / Eklentinin benzersiz tanımlayıcısı
   * @returns Operation result / İşlem sonucu
   */
  async enablePlugin(pluginId: string, options?: RequestOptions): Promise<InsurUpResult> {
    return this.http.postNoContent(plugins.enable.render(pluginId), {}, options);
  }

  /**
   * Disables the plugin, stopping hook dispatch (the active version is retained).
   *
   * Eklentiyi devre dışı bırakır ve kanca gönderimini durdurur (etkin sürüm korunur).
   *
   * @param pluginId Unique identifier of the plugin / Eklentinin benzersiz tanımlayıcısı
   * @returns Operation result / İşlem sonucu
   */
  async disablePlugin(pluginId: string, options?: RequestOptions): Promise<InsurUpResult> {
    return this.http.postNoContent(plugins.disable.render(pluginId), {}, options);
  }

  /**
   * Sets the plugin's per-agent config. Values are validated against the active version's JSON Schema;
   * secret (`writeOnly`) fields are encrypted at rest.
   *
   * Eklentinin acente bazlı yapılandırmasını ayarlar. Değerler etkin sürümün JSON Şemasına göre doğrulanır.
   *
   * @param pluginId Unique identifier of the plugin / Eklentinin benzersiz tanımlayıcısı
   * @param request The config values / Yapılandırma değerleri
   * @returns Operation result / İşlem sonucu
   */
  async updatePluginConfig(
    pluginId: string,
    request: UpdatePluginConfigRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.putNoContent(plugins.updateConfig.render(pluginId), request, options);
  }

  /**
   * Sets the plugin's ordering priority for the sequential (validate/mutate/igw) hooks.
   *
   * Sıralı kancalar için eklentinin öncelik değerini ayarlar.
   *
   * @param pluginId Unique identifier of the plugin / Eklentinin benzersiz tanımlayıcısı
   * @param request The priority value / Öncelik değeri
   * @returns Operation result / İşlem sonucu
   */
  async setPluginPriority(
    pluginId: string,
    request: SetPluginPriorityRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.putNoContent(plugins.setPriority.render(pluginId), request, options);
  }

  /**
   * Fetches recent invocation logs for the plugin, most recent first.
   *
   * Eklenti için en yeni önce olmak üzere son çalıştırma günlüklerini getirir.
   *
   * @param pluginId Unique identifier of the plugin / Eklentinin benzersiz tanımlayıcısı
   * @param logOptions Optional limit and hook-name filter / İsteğe bağlı limit ve kanca adı filtresi
   * @returns Invocation log entries / Çalıştırma günlüğü kayıtları
   */
  async getPluginLogs(
    pluginId: string,
    logOptions?: GetPluginLogsOptions,
    options?: RequestOptions
  ): Promise<InsurUpResult<PluginInvocationLog[]>> {
    return this.http.get<PluginInvocationLog[]>(plugins.logs.render(pluginId, logOptions), options);
  }
}
