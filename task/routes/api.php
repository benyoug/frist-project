<?php

use App\Http\Controllers\TaskController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Route de test
Route::get('/test', function () {
    return response()->json([
        'message' => 'API Laravel DCS fonctionne parfaitement !',
        'status' => 'success',
        'timestamp' => now()
    ]);
});

// Routes d'authentification (publiques)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées par authentification
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    
    // Autres routes protégées ici...

    Route::get('get-member-task' , [TaskController::class,'getTaskOfMember']);
});



// Routes d'authentification pour les tâches (pour compatibilité)
Route::post('/tasks/login', [AuthController::class, 'login']);

// Route pour les données de support
Route::get('/tasks/support-data', function () {
    return response()->json([
        'states' => [
            ['id' => 1, 'name' => 'Ouvert', 'color' => '#6b7280'],
            ['id' => 2, 'name' => 'En cours', 'color' => '#3b82f6'],
            ['id' => 3, 'name' => 'Terminé', 'color' => '#10b981']
        ],
        'priorities' => [
            ['id' => 1, 'name' => 'Urgente', 'color' => '#ef4444'],
            ['id' => 2, 'name' => 'Haute', 'color' => '#f59e0b'],
            ['id' => 3, 'name' => 'Moyenne', 'color' => '#3b82f6'],
            ['id' => 4, 'name' => 'Basse', 'color' => '#6b7280']
        ],
        'types' => [
            ['id' => 1, 'name' => 'Développement / Conception'],
            ['id' => 2, 'name' => 'Test / Assurance qualité'],
            ['id' => 3, 'name' => 'Formation / déploiement'],
            ['id' => 4, 'name' => 'Administratif'],
            ['id' => 5, 'name' => 'Documentation']
        ]
    ]);
});

// Routes pour les résumés journaliers (simulation temporaire)
Route::get('/daily-resumes', function () {
    return response()->json([]);
});

Route::post('/daily-resumes', function () {
    return response()->json(['message' => 'Résumé ajouté avec succès']);
});