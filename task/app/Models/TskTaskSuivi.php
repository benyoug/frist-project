<?php

namespace App\Models;

use App\Dcs\Facades\Helper;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Database\Eloquent\SoftDeletes;

class TskTaskSuivi extends Model
{


    use SoftDeletes;

    protected $table = 'tsk_task_suivis';

    protected $fillable = [
        'tsk_task_id',
        'tsk_member_id',
        'tsk_state_id',
        'commentaire',

    ];

    protected $appends = ['libelle'];


    function tsk_state(): BelongsTo
    {
        return $this->belongsTo(TskState::class, 'tsk_state_id');
    }
    public function getLibelleAttribute(){
        return Helper::getFieldTranslated($this);
    }

    function tsk_task(): BelongsTo
    {
        return $this->belongsTo(TskTask::class, 'tsk_task_id');
    }



    public function tsk_members(): BelongsToMany
    {
        return $this->belongsToMany(TskMember::class, 'tsk_tasks_tsk_members', 'tsk_task_id', 'tsk_member_id')->where('tsk_tasks_tsk_members.deleted_at', null);
    }

    public function tsk_task_members()
    {
        return $this->hasMany(TskTasksTskMember::class, 'tsk_task_id');
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
