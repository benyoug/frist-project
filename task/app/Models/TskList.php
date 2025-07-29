<?php

namespace App\Models\Models;

use App\Dcs\Facades\Helper;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TskList extends Model
{

    use SoftDeletes;

    protected $table = 'tsk_lists';

    protected $fillable = [
        'libelle_fr',
        'libelle_ar',
        'tsk_project_id',
        'created_at',
        'updated_at',
        'deleted_at'
    ];
    protected $appends = ['libelle'];

    function tsk_project()
    {
        return $this->belongsTo(TskProject::class, 'tsk_project_id');
    }
    function tsk_tasks()
    {
        return $this->hasMany(TskTask::class, 'tsk_list_id');
    }
    function tsk_lists_tsk_members()
    {
        return $this->hasMany(TskListsTskMember::class, 'tsk_list_id');
    }

    public function members()
    {
        return $this->belongsToMany(TskMember::class, 'tsk_lists_tsk_members', 'tsk_list_id', 'tsk_member_id');
    }
    public function getLibelleAttribute(){
        return Helper::getFieldTranslated($this);
    }

}
