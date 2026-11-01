<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CapturedDocument;
use App\Models\Invoice;
use App\Services\IntelligentDataCaptureService;
use App\Services\PdfDocumentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ZeroDataCaptureController extends Controller
{
    public function __construct(
        protected IntelligentDataCaptureService $captureService,
        protected PdfDocumentService $pdfService
    ) {}

    /**
     * Upload Document / Invoice Image / PDF / Spreadsheet for AI Data Extraction
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'nullable|file|mimes:jpg,jpeg,png,pdf,xlsx,csv|max:10240',
            'source_type' => 'nullable|string|in:invoice_scan,pdf_document,excel_import,whatsapp_command,manual_ai',
            'manual_data' => 'nullable|array',
        ]);

        $tenantId = $request->user()->tenant_id;
        $file = $request->file('file');
        $sourceType = $request->input('source_type', $file ? 'invoice_scan' : 'manual_ai');
        $manualData = $request->input('manual_data');

        $doc = $this->captureService->extractFromDocument(
            $file,
            $sourceType,
            $tenantId,
            $request->user(),
            $manualData
        );

        return response()->json([
            'success' => true,
            'message' => 'Document scanned and parsed with AI data extraction.',
            'data' => $doc,
        ], 201);
    }

    /**
     * Voice Command Ingestion (Gujarati, Hindi, English)
     */
    public function voiceCommand(Request $request): JsonResponse
    {
        $request->validate([
            'transcript' => 'required|string',
            'language' => 'nullable|string|in:gu,hi,en',
        ]);

        $language = $request->input('language', 'en');
        $result = $this->captureService->processVoiceCommand(
            $request->input('transcript'),
            $language,
            $request->user()
        );

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    /**
     * Ingest Digital Weighing Scale Reading (0.001g Precision)
     */
    public function scaleReading(Request $request): JsonResponse
    {
        $request->validate([
            'gross_weight' => 'required|numeric|min:0.001|max:10000',
            'tare_weight' => 'nullable|numeric|min:0',
            'item_description' => 'nullable|string',
        ]);

        $doc = $this->captureService->processWeighingScaleReading(
            (float) $request->input('gross_weight'),
            $request->filled('tare_weight') ? (float) $request->input('tare_weight') : null,
            $request->user()->tenant_id,
            $request->user(),
            $request->input('item_description')
        );

        return response()->json([
            'success' => true,
            'message' => 'Digital scale reading verified and recorded.',
            'data' => $doc,
        ], 201);
    }

    /**
     * Fast Barcode / RFID / HUID Scan Lookup & Valuation
     */
    public function barcodeScan(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $result = $this->captureService->processBarcodeOrRfidScan(
            $request->input('code'),
            $request->user()->tenant_id,
            $request->user()
        );

        return response()->json($result);
    }

    /**
     * View Approval Queue (Safety & Human Control)
     */
    public function queue(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        $status = $request->input('status', 'pending_approval');

        $query = CapturedDocument::where('tenant_id', $tenantId)->with(['user', 'approvedBy']);

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $docs = $query->latest()->paginate(25);

        return response()->json([
            'success' => true,
            'data' => $docs->items(),
            'total' => $docs->total(),
            'pending_count' => CapturedDocument::where('tenant_id', $tenantId)->where('status', 'pending_approval')->count(),
        ]);
    }

    /**
     * Approve and Commit Captured Transaction to Showroom Registers
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        $doc = CapturedDocument::where('tenant_id', $tenantId)->findOrFail($id);

        $result = $this->captureService->approveAndCommit($doc, $request->user());

        return response()->json($result);
    }

    /**
     * Reject Unverified or Malformed Document
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $request->validate(['reason' => 'required|string']);

        $tenantId = $request->user()->tenant_id;
        $doc = CapturedDocument::where('tenant_id', $tenantId)->findOrFail($id);

        $rejected = $this->captureService->rejectDocument($doc, $request->user(), $request->input('reason'));

        return response()->json([
            'success' => true,
            'message' => 'Document rejected and moved to archive.',
            'data' => $rejected,
        ]);
    }

    /**
     * Reversal of Approved Transaction
     */
    public function reverse(Request $request, int $id): JsonResponse
    {
        $request->validate(['reason' => 'required|string']);

        $tenantId = $request->user()->tenant_id;
        $doc = CapturedDocument::where('tenant_id', $tenantId)->findOrFail($id);

        $result = $this->captureService->reverseOperation($doc, $request->user(), $request->input('reason'));

        return response()->json($result);
    }

    /**
     * Render Printable PDF / Thermal Receipt
     */
    public function printInvoice(Request $request, int $id): Response
    {
        $user = $request->user();
        if (!$user) {
            $token = $request->query('token') ?: $request->bearerToken();
            if ($token) {
                $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
                if ($accessToken) {
                    $user = $accessToken->tokenable;
                    \Illuminate\Support\Facades\Auth::setUser($user);
                }
            }
        }

        if (!$user) {
            abort(401, 'Unauthenticated invoice access. Please log in.');
        }

        \App\Services\TenantContext::setTenantId($user->tenant_id);

        $invoice = Invoice::where('tenant_id', $user->tenant_id)->with(['items', 'customer', 'branch', 'tenant'])->findOrFail($id);

        $format = $request->input('format', 'a4');
        $lang = $request->input('lang', 'en');

        if ($format === 'thermal') {
            $html = $this->pdfService->renderThermalReceipt($invoice);
        } else {
            $html = $this->pdfService->renderA4Invoice($invoice, $lang);
        }

        return response($html)->header('Content-Type', 'text/html');
    }
}
