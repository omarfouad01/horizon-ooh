<?php
require $argv[1];
use App\Support\LegacyPublicRedirect as Redirect;
$routes=['/','/ar','/about','/ar/about','/terms','/ar/terms','/locations','/ar/locations',
 '/locations/giza/billboards/example','/ar/locations/giza/billboards/example',
 '/projects/campaign','/ar/projects/campaign','/ar/blog/article',
 '/services/airport-advertising-in-egypt','/ar/services/dooh-advertising-in-egypt'];
$cases=[
 ['en/home','/'],['ar/home','/ar'],['en','/'],['en/about-us','/about'],['ar/about-us/why-choose-us','/ar/about'],
 ['ar/terms-and-conditions','/ar/terms'],['ar/products','/ar/locations'],['products','/locations'],
 ['ar/product/example','/ar/locations/giza/billboards/example'],['en/product/example','/locations/giza/billboards/example'],
 ['product/example','/locations/giza/billboards/example'],['ar/project/campaign','/ar/projects/campaign'],
 ['en/services/airport-advertising','/services/airport-advertising-in-egypt'],['ar/services/digital-out-of-home','/ar/services/dooh-advertising-in-egypt'],
 ['ar/product/missing',null],['ar/project/draft',null],['ar/products/airport',null],['ar/blog/article',null],
 ['ar/admin',null],['en/admin',null],['ar/password/reset',null],['https://evil.test',null],['ar/product/../example',null],
 ['ar/product/%2e%2e',null],['ar/products?page=8',null],['locations',null],['',null],
];
foreach($cases as [$from,$expected])if(Redirect::resolve($from,$routes)!==$expected)throw new RuntimeException('Failed: '.$from);
$ambiguous=array_merge($routes,['/ar/locations/cairo/billboards/example']);
if(Redirect::resolve('ar/product/example',$ambiguous)!==null)throw new RuntimeException('Ambiguous slug redirected');
echo 'PASS: '.(count($cases)+1).' legacy URL, locale, missing content and safety checks'.PHP_EOL;
