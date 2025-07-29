<?php

namespace App\Models;

use App\Dcs\Facades\Helper;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Database\Eloquent\SoftDeletes;

class TskTask extends Model
{


    use SoftDeletes;

    protected $table = 'tsk_tasks';

    protected $fillable = [
        'libelle_fr',
        'libelle_ar',
        'date_deb_reel',
        'date_fin_reel',
        'date_deb_prev',
        'date_fin_prev',
        'tsk_list_id',
        'tsk_priority_id',
        'tsk_state_id',
        'tsk_poid_id',
        'file',
        'tsk_type_id',
        'created_at',
        'updated_at',
        'deleted_at',
        'source',
        'source_id',
        'commentaire',
        'code',
        'objectif_et_contexte',  // New column
        'details_techniques',    // New column
        'condition_de_validation', // New column
        'dependances',           // New column
        'contraintes',           // New column
        'historique_de_mise_a_jour', // New column
        'remarques_du_developpeur', // New column
    ];
    protected $casts = [
        'date_deb_reel' => 'datetime',
        'date_fin_reel' => 'datetime',
        'date_deb_prev' => 'datetime',
        'date_fin_prev' => 'datetime',
    ];
    protected $appends = ['libelle'];

    function tsk_list(): BelongsTo
    {
        return $this->belongsTo(TskList::class, 'tsk_list_id');
    }
    function tsk_state(): BelongsTo
    {
        return $this->belongsTo(TskState::class, 'tsk_state_id');
    }
    function tsk_priority(): BelongsTo
    {
        return $this->belongsTo(TskPriority::class, 'tsk_priority_id');
    }


    public function tsk_members(): BelongsToMany
    {
        return $this->belongsToMany(TskMember::class, 'tsk_tasks_tsk_members', 'tsk_task_id', 'tsk_member_id')->where('tsk_tasks_tsk_members.deleted_at', null);
    }

    public function tsk_task_members()
    {
        return $this->hasMany(TskTasksTskMember::class, 'tsk_task_id');
    }

    public function tsk_task_suivi()
    {
        return $this->hasMany(TskTaskSuivi::class, 'tsk_task_id');
    }

    
    public function tsk_type(): BelongsTo
    {
        return $this->belongsTo(TskType::class, 'tsk_type_id');
    }

    public function tsk_project(): HasOneThrough
    {
        return $this->hasOneThrough(TskProject::class, TskList::class, 'id', 'id', 'tsk_list_id', 'tsk_project_id');
    }

    public function getLibelleAttribute(){
        return Helper::getFieldTranslated($this);
    }

    public function isInDate($date): bool
    {
//        if ($this->tsk_types_horaire_id) {
//            return $this->isInDateWithHour($date);
//        }
       $date_debut = Carbon::parse($this->date_deb_reel->toDateString()." 00:00:00");
       $date_fin = Carbon::parse($this->date_fin_reel->toDateString()." 23:59:00");
//       if (($this->id==49 || $this->id=48) && $date->toDateString()=='2023-06-23'){
//           dd($date,$date_debut->format('Y-m-d H:i:ss') <= $date->addHour() && $date_fin->format('Y-m-d H:i:ss') >= $date->addHour());
//       }
        return $date_debut->format('Y-m-d H:i:ss') <= $date->addHour() && $date_fin->format('Y-m-d H:i:ss') >= $date->addHour();
    }

    public function isInDateWithHour($date): bool
    {
        $date_debut = Carbon::parse($this->date_deb_reel);
        $date_fin = Carbon::parse($this->date_fin_reel);
        return $date_debut->format('Y-m-d') <= $date->format('Y-m-d') && $date_fin->format('Y-m-d') >= $date->format('Y-m-d');
    }

    public function tsk_type_horaire(): BelongsTo
    {
        return $this->belongsTo(TskTypesHoraire::class, 'tsk_types_horaire_id');
    }
}
