<?php

namespace App\Models;

use App\Dcs\Facades\Helper;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DailyResume extends Model
{
    use SoftDeletes;
    protected  $table = 'daily_resumes';
    protected $fillable = [
        'member_id',
        'description',
        'day',
    ];
    public function member()
    {
        return $this->belongsTo(TskMember::class, 'member_id');
    }
}
